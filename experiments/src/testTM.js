var AsyncLock = require('async-lock');
var GLOBALLOCK = new AsyncLock();

MIN_VALUE = 0;
MAX_VALUE = 1000000;

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

const waitSimple = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};


THREADINDEX = 1;
THREADLOCALS = {};


class ThreadLocal {
    constructor(transaction) {
         this.ID = THREADINDEX;
         THREADINDEX++;
         THREADLOCALS[this.ID] = this;
         this.local = transaction;
    }

    getLocal() {
        return this.local;
    }
    setLocal(transaction) {
        this.local = transaction;
    }
}



class Transaction {
    constructor(myStatus = 'ACTIVE') {
        this.status = myStatus;
    }
    getStatus() {
        return this.status;
    }
    commit() {
        if (this.status == 'ACTIVE') {
            this.status = 'COMMITTED';
            return true;
        } else {
            return false;
        }
    }
    abort() {
        if (this.status == 'ACTIVE') {
            this.status = 'ABORTED';
            return true;
        } else {
            return false;
        }
    }
}


class ContentionManager {
    constructor() {
        var MIN_DELAY = 0;
        var MAX_DELAY = 5;
        var previous = null;
        var delay = MIN_DELAY;
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }

    resolve(me, other) {
        if (other != previous) {
            previous = other;
            delay = MIN_DELAY;
        }
        if (delay < MAX_DELAY) {
            waitSimple(getRandomInt(delay));
            delay = 2 * delay;
        } else {
            other.abort();
            delay = MIN_DELAY;
        }
    }
}



localTransaction = new ThreadLocal(new Transaction('COMMITTED'));
localManager = new ContentionManager();





function atomically(xaction) {
    var result = null;
    while (true) {
        me = new Transaction();
        localTransaction.setLocal(me);
        try {
            result = xaction();
        } catch (e) {
            throw new Error(e); //Different for AbortedException
        }
        if (me.commit()) {
            return result;
        }
        me.abort();
    }
}





class Node {
    constructor(element) {
        this.element = element;
        this.key = hashCode(element);
        this.next = null
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }
 
    add(element) {
        let node = new Node(element);
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
 
    insertAt(element, index) {
        if (index < 0 || index > this.size)
            return console.log("Please enter a valid index.");
        else {
            let node = new Node(element);
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
            return curr.element;
        }
    }

    removeElement(element) {
        let current = this.head;
        let prev = null;
        while (current != null) {
            if (current.element === element) {
                if (prev == null) {
                    this.head = current.next;
                } else {
                    prev.next = current.next;
                }
                this.size--;
                return current.element;
            }
            prev = current;
            current = current.next;
        }
        return -1;
    }
 
    indexOf(element) {
        let count = 0;
        let current = this.head;
        while (current != null) {
            if (current.element === element)
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
            str += curr.element + " ";
            curr = curr.next;
        }
        console.log(str);
    }
}

class CoarseList extends LinkedList {
    constructor() {
        super();
        this.head = new Node(MIN_VALUE);
        this.head.next = new Node(MAX_VALUE);
        this.size = 2;
    }

    copyTo(otherList) {
        otherList.head = JSON.parse(JSON.stringify(this.head));
        otherList.head.key = JSON.parse(JSON.stringify(this.head.key));
        otherList.head.element = JSON.parse(JSON.stringify(this.head.element));
        otherList.head.next = JSON.parse(JSON.stringify(this.head.next));
        otherList.size = JSON.parse(JSON.stringify(this.size));
    }

    add(item) {
        var self = this;
        var pred, curr;
        var key = hashCode(item);
        GLOBALLOCK.acquire("this", function(done) {
            pred = self.head;
            curr = pred.next;
            while (curr.key < key) {
                pred = curr;
                curr = curr.next;
            }
            if (key == curr.key) {
                done("", false);
            } else {
                var node = new Node(item);
                node.next = curr;
                pred.next = node;
                done("", true);
            }
        },function (err, ret) {
            if (err) {
                throw new Error(err);
            }
        });

        // GLOBALLOCK.acquire("this", function() {
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
    }
    
    remove(item) {
        var self = this;
        var pred, curr;
        var key = hashCode(item);
        GLOBALLOCK.acquire("this", function(done) {
            pred = self.head;
            curr = pred.next;
            while (curr.key < key) {
                pred = curr;
                curr = curr.next;
            }
            if (key == curr.key) {
                pred.next = curr.next;
                done("", true);
            } else {
                done("", false);
            }
        }, function(err, ret) {
            //unlock here
            if (err) {
                throw new Error("Error");
            }
        });
    }
}


class TCoarseList extends CoarseList {
    constructor() {
        super();
        this.atomic = new FreeObject();
    }
    add(item) {
        var self = this;
        return atomically(function() {
            self.atomic.openWrite().add(item);
        });
    }
    remove(item) {
        var self = this;
        return atomically(function() {
            self.atomic.openWrite().remove(item);
        });
    }
    size_of_list() {
        var self = this;
        return atomically(function() {
            self.atomic.openRead().size_of_list();
        });
    }
    printList() {
        var self = this;
        return atomically(function() {
            self.atomic.openRead().printList();
        });
    }
}


class Locator {
    constructor() {
        this.owner = localTransaction.getLocal(); //transaction
        this.oldVersion = new CoarseList();
        this.newVersion = new CoarseList();
    }
}

class FreeObject {
    constructor() {
        this.start = new Locator();
    }
    
    openWrite() {
        me = localTransaction.getLocal();
        switch (me.getStatus()) {
            case 'COMMITTED': return this.start.newVersion; //it was current start's new version
            case 'ABORTED': throw new Error();
            case 'ACTIVE':
                if (this.start.owner == me) {
                    return this.start.newVersion;
                }    
                var newLocator = new Locator();
                while (localTransaction.getLocal().getStatus() == 'ACTIVE') {
                    var oldLocator = this.start;
                    var owner = oldLocator.owner;
                    switch (owner.getStatus()) {
                        case 'COMMITTED':
                            newLocator.oldVersion = oldLocator.newVersion;
                            break;
                        case 'ABORTED':
                            newLocator.oldVersion = oldLocator.oldVersion;
                            break;
                        case 'ACTIVE':
                            localManager.resolve(me, owner);
                            continue;
                    }
                    try {
                        newLocator.newVersion = new CoarseList();
                    } catch (ex) {throw new PanicException(ex);}
                    newLocator.oldVersion.copyTo(newLocator.newVersion);
                    if (this.start == oldLocator) {
                        this.start = newLocator;
                        return newLocator.newVersion;
                    }
                }
                me.abort();
                throw new Error();
            default: throw new PanicException("Unexpected transaction state");
        }
    }

    openRead() {
        me = localTransaction.getLocal();
        switch (me.getStatus()) {
            case 'COMMITTED': return this.start.newVersion; //it was current start's new version
            case 'ABORTED': throw new Error();
            case 'ACTIVE':
                if (this.start.owner == me) {
                    return this.start.newVersion;
                }    
                var newLocator = new Locator();
                while (localTransaction.getLocal().getStatus() == 'ACTIVE') {
                    var oldLocator = this.start;
                    var owner = oldLocator.owner;
                    switch (owner.getStatus()) {
                        case 'COMMITTED':
                            newLocator.oldVersion = oldLocator.newVersion;
                            break;
                        case 'ABORTED':
                            newLocator.oldVersion = oldLocator.oldVersion;
                            break;
                        case 'ACTIVE':
                            localManager.resolve(me, owner);
                            continue;
                    }
                    try {
                        newLocator.newVersion = new CoarseList();
                    } catch (ex) {throw new PanicException(ex);}
                    newLocator.oldVersion.copyTo(newLocator.newVersion);
                    if (this.start == oldLocator) {
                        this.start = newLocator;
                        return newLocator.newVersion;
                    }
                }
                me.abort();
                throw new Error();
            default: throw new PanicException("Unexpected transaction state");
        }
    }

    validate() {
        if (localTransaction.getLocal().getStatus() == 'ACTIVE') { return true; }
        else { return false;}
    }
}






/*Testing with linked list */
// mycoarse = new TCoarseList();
// mycoarse.add(100);
// mycoarse.add(20);
// mycoarse.add(30);
// mycoarse.add(40);
// mycoarse.remove(30);
// mycoarse.add(50);
// setTimeout(() => {
//     mycoarse.printList();
// }, 2000);



/*Testing with normal functions */
// inside atomic transaction
// empty_list_tm = {'root': null};

// function list_insert_tm(lst, data) {
//   function helper() {
//     new_elem = {'head': data, 'tail': lst['root']};
//     lst['root'] = new_elem;
//   }
//   atomically(helper);
//   console.log(lst);
// }

// list_insert_tm(empty_list_tm, 'hi');