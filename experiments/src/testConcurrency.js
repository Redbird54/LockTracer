var AsyncLock = require('async-lock');
var GLOBALLOCK = new AsyncLock();
var GLOBALLOCK2 = new AsyncLock();

MIN_VALUE = 0;
MAX_VALUE = 1000000;


// https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
hashCode = function(s) {
    if (typeof(s) == 'number') {
        s = s.toString();
    }
    var h = 0, l = s.length, i = 0;
    if ( l > 0 )
      while (i < l)
        h = (h << 5) - h + s.charCodeAt(i++) | 0;
    return h;
};

class Node {
    constructor(item) {
        this.item = item;
        this.key = hashCode(item);
        this.next = null
    }
}


// https://www.geeksforgeeks.org/implementation-linkedlist-javascript/
class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }
 
    add(item) {
        let node = new Node(item);
        let current;
        if (this.head == null)
            this.head = node;
        else {
            current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = node;
        }
        this.size++;
    }
 
    insertAt(item, index) {
        if (index < 0 || index > this.size)
            return console.log("Please enter a valid index.");
        else {
            let node = new Node(item);
            let curr, prev;
            curr = this.head;
            if (index == 0) {
                node.next = this.head;
                this.head = node;
            } else {
                curr = this.head;
                let it = 0;
                while (it < index) {
                    it++;
                    prev = curr;
                    curr = curr.next;
                }
                node.next = curr;
                prev.next = node;
            }
            this.size++;
        }
    }
 
    removeFrom(index) {
        if (index < 0 || index >= this.size)
            return console.log("Please Enter a valid index");
        else {
            let curr, prev, it = 0;
            curr = this.head;
            prev = curr;
            if (index === 0) {
                this.head = curr.next;
            } else {
                while (it < index) {
                    it++;
                    prev = curr;
                    curr = curr.next;
                }
                prev.next = curr.next;
            }
            this.size--;
            return curr.item;
        }
    }

    removeElement(item) {
        let current = this.head;
        let prev = null;
        while (current != null) {
            if (current.item === item) {
                if (prev == null) {
                    this.head = current.next;
                } else {
                    prev.next = current.next;
                }
                this.size--;
                return current.item;
            }
            prev = current;
            current = current.next;
        }
        return -1;
    }
 
    indexOf(item) {
        let count = 0;
        let current = this.head;
        while (current != null) {
            if (current.item === item)
                return count;
            count++;
            current = current.next;
        }
        return -1;
    }

    isEmpty() {
        return this.size == 0;
    }
 
    size_of_list() {
        console.log(this.size);
    }

    printList() {
        let curr = this.head;
        let str = "";
        while (curr) {
            str += curr.item + " ";
            curr = curr.next;
        }
        console.log(str);
    }
}

class CoarseList extends LinkedList {
    constructor() {
        super();
        this.lock = new AsyncLock();
        this.head = new Node(MIN_VALUE);
        this.head.next = new Node(MAX_VALUE);
        this.size = 2;
    }

    add(item) {
        var self = this;
        var pred, curr;
        var key = hashCode(item);
        /* Promise Mode */
        // this.lock.acquire("this", function addFn() {
        //     pred = self.head;
        //     curr = pred.next;
        //     while (curr.key < key) {
        //         pred = curr;
        //         curr = curr.next;
        //     }
        //     if (key == curr.key) {
        //         return false;
        //     } else {
        //         var node = new Node(item);
        //         node.next = curr;
        //         pred.next = node;
        //         return true;
        //     }
        // }).then(function (ret) {
        //     //unlock here
        // }, function(err) {
        //     throw new Error(err);
        // });

        /* CB Mode */
        this.lock.acquire("this", function(done) {
            pred = self.head;
            curr = pred.next;
            while (curr.key < key) {
                pred = curr;
                curr = curr.next;
            }
            if (key == curr.key) {
                done(undefined, false);
            } else {
                var node = new Node(item);
                node.next = curr;
                pred.next = node;
                done(undefined, true);
            }
        }, function (err, ret) {
            //unlock here
            if (err) {
                throw new Error(err);
            }
        });
    }
    
    remove(item) {
        var self = this;
        var pred, curr;
        var key = hashCode(item);
        GLOBALLOCK.acquire("this", function removeFn() {
            pred = self.head;
            curr = pred.next;
            while (curr.key < key) {
                pred = curr;
                curr = curr.next;
            }
            if (key == curr.key) {
                pred.next = curr.next;
                return true;
            } else {
                return false;
            }
        }).then(function(ret) {
            //unlock here
        }, function(err) {
            throw new Error("Error");
        });
    }
}


class OptimisticList extends LinkedList {
    constructor() {
        super();
        this.lock = new AsyncLock();
        this.head = new Node(MIN_VALUE);
        this.head.next = new Node(MAX_VALUE);
        this.size = 2;
    }

    add(item) {
        var self = this;
        var key = hashCode(item);
        var isLoop = true;
        while (isLoop) {
            var pred = this.head;
            var curr = pred.next;
            while (curr.key < key) {
                pred = curr; 
                curr = curr.next;
            }
            this.lock.acquire(["pred", "curr"], function(done) {
                if (self.validate(pred, curr)) {
                    if (curr.key == key) {
                        done("", false);
                    } else {
                        var node = new Node(item);
                        node.next = curr;
                        pred.next = node;
                        done("", true);
                    } 
                } else {
                    done("FAILED");
                }
            }, function(err, ret) {
                if (err) {
                    throw new Error(err);
                }
                isLoop = false;
            });
        }
    }
    
    remove(item) {
        var self = this;
        var key = hashCode(item);
        var isLoop = true;
        while (isLoop) {
            var pred = this.head;
            var curr = pred.next;
            while (curr.key < key) {
                pred = curr; 
                curr = curr.next;
            }
            this.lock.acquire(["pred", "curr"], function(done) {
                if (self.validate(pred, curr)) {
                    if (curr.key == key) {
                        pred.next = curr.next;
                        done("", true);
                    } else {
                        done("", false);
                    }
                } else {
                    done("FAILED");
                }
            }, function(err, ret) {
                if (err) {
                    throw new Error(err);
                }
                isLoop = false;
            });
        }
    }

    contains(item) {
        var self = this;
        var key = hashCode(item);
        var isLoop = true;
        while (isLoop) {
            var pred = this.head;
            var curr = pred.next;
            while (curr.key < key) {
                pred = curr;
                curr = curr.next;
            }
            this.lock.acquire(["pred", "curr"], function(done) {
                if (validate(pred, curr)) {
                    done("", curr.key == key);
                } else {
                    done("FAILED");
                }
            }, function(err, ret) {
                if (err) {
                    throw new Error(err);
                }
                isLoop = false;
            });
        }
    }

    validate(pred, curr) {
        var node = this.head;
        while (node.key <= pred.key) {
            if (node == pred) {
                return pred.next == curr;
            }   
            node = node.next;
        }
        return false;
    }
}

class LazyList extends LinkedList {
    constructor() {
        super();
        this.lock = new AsyncLock();
        this.head = new Node(MIN_VALUE);
        this.head.next = new Node(MAX_VALUE);
        this.size = 2;
    }

    add(item) {
        var self = this;
        var key = hashCode(item);
        var isLoop = true;

        function myFN(done) {
            if (self.validate(pred, curr)) {
                if (curr.key == key) {
                    done("", false);
                } else {
                    var node = new Node(item);
                    node.next = curr;
                    pred.next = node;
                    done("", true);
                }
            } else {
                done("FAILED");
            }
        }

        while (isLoop) {
            var pred = this.head;
            var curr = this.head.next;
            while (curr.key < key) {
                pred = curr; 
                curr = curr.next;
            }

            /* Testing multiple locks with same FN critical section (myFN) */
            this.lock.acquire(["pred", "curr"], myFN, function(err, ret) {
                if (err) {
                    throw new Error(err);
                }
                isLoop = false;
            });
            GLOBALLOCK.acquire(["pred", "curr"], myFN, function(err, ret) {
                if (err) {
                    throw new Error(err);
                }
                isLoop = false;
            });

            /* Testing batch promise mode */
            // this.lock.acquire(["pred", "curr"], function() {
            //     if (self.validate(pred, curr)) {
            //         if (curr.key == key) {
            //             return false;
            //         } else {
            //             var node = new Node(item);
            //             node.next = curr;
            //             pred.next = node;
            //             return true;
            //         }
            //     }
            // }).then(function(ret) {
            //     isLoop = false;
            // }, function(err) {
            //     throw new Error(err);
            // });
        }
    }
    
    remove(item) {
        var self = this;
        var key = hashCode(item);
        var isLoop = true;
        while (isLoop) {
            var pred = this.head;
            var curr = this.head.next;
            while (curr.key < key) {
                pred = curr; 
                curr = curr.next;
            }
            this.lock.acquire(["pred", "curr"], function(done) {
                if (self.validate(pred, curr)) {
                    if (curr.key != key) {
                        done("", false);
                    } else {
                        curr.marked = true;
                        pred.next = curr.next;
                        done("", true);
                    }
                } else {
                    done("FAILED");
                }
            }, function(err, ret) {
                if (err) {
                    throw new Error(err);
                }
                isLoop = false;
            });
        }
    }

    contains(item) {
        var self = this;
        var key = hashCode(item);
        var curr = this.head;
        while (curr.key < key) {
            curr = curr.next;
            return (curr.key == key && !curr.marked);
        }
    }

    validate(pred, curr) {
        return (!pred.marked && !curr.marked && pred.next == curr);
    }
}

/* CoarseList Tests */
// var mycoarse = new CoarseList();
// mycoarse.add(100);
// mycoarse.add(20);
// mycoarse.add(30);
// mycoarse.add(40);
// mycoarse.remove(30);
// mycoarse.add(50);
// setTimeout(() => {
//     mycoarse.printList();
// }, 2000);


/* OptimisticList Tests */
// var myoptim = new OptimisticList();
// myoptim.add(100);
// myoptim.add(20);
// myoptim.add(30);
// myoptim.add(40);
// myoptim.printList();
// myoptim.remove(30);
// myoptim.add(50);
// setTimeout(() => {
//     myoptim.printList();
// }, 2000);


/* LazyList Tests */
var mylazy = new LazyList();
mylazy.add(100);
mylazy.add(20);
mylazy.add(30);
mylazy.add(40);
mylazy.remove(30);
mylazy.add(50);
setTimeout(() => {
    mylazy.printList();
}, 2000);