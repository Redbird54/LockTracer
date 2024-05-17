"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
var AsyncLock = require('../../async-lock/index.js');
var GLOBALLOCK = new AsyncLock();
var GLOBALLOCK2 = new AsyncLock();
MIN_VALUE = 0;
MAX_VALUE = 1000000;

// https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
hashCode = function hashCode(s) {
  if (typeof s == 'number') {
    s = s.toString();
  }
  var h = 0,
    l = s.length,
    i = 0;
  if (l > 0) while (i < l) h = (h << 5) - h + s.charCodeAt(i++) | 0;
  return h;
};
var Node = /*#__PURE__*/_createClass(function Node(item) {
  _classCallCheck(this, Node);
  this.item = item;
  this.key = hashCode(item);
  this.next = null;
}); // https://www.geeksforgeeks.org/implementation-linkedlist-javascript/
var LinkedList = /*#__PURE__*/function () {
  function LinkedList() {
    _classCallCheck(this, LinkedList);
    this.head = null;
    this.size = 0;
  }
  _createClass(LinkedList, [{
    key: "add",
    value: function add(item) {
      var node = new Node(item);
      var current;
      if (this.head == null) this.head = node;else {
        current = this.head;
        while (current.next) {
          current = current.next;
        }
        current.next = node;
      }
      this.size++;
    }
  }, {
    key: "insertAt",
    value: function insertAt(item, index) {
      if (index < 0 || index > this.size) return console.log("Please enter a valid index.");else {
        var node = new Node(item);
        var curr, prev;
        curr = this.head;
        if (index == 0) {
          node.next = this.head;
          this.head = node;
        } else {
          curr = this.head;
          var it = 0;
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
  }, {
    key: "removeFrom",
    value: function removeFrom(index) {
      if (index < 0 || index >= this.size) return console.log("Please Enter a valid index");else {
        var curr,
          prev,
          it = 0;
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
  }, {
    key: "removeElement",
    value: function removeElement(item) {
      var current = this.head;
      var prev = null;
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
  }, {
    key: "indexOf",
    value: function indexOf(item) {
      var count = 0;
      var current = this.head;
      while (current != null) {
        if (current.item === item) return count;
        count++;
        current = current.next;
      }
      return -1;
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      return this.size == 0;
    }
  }, {
    key: "size_of_list",
    value: function size_of_list() {
      console.log(this.size);
    }
  }, {
    key: "printList",
    value: function printList() {
      var curr = this.head;
      var str = "";
      while (curr) {
        str += curr.item + " ";
        curr = curr.next;
      }
      console.log(str);
    }
  }]);
  return LinkedList;
}();
var CoarseList = /*#__PURE__*/function (_LinkedList) {
  _inherits(CoarseList, _LinkedList);
  var _super = _createSuper(CoarseList);
  function CoarseList() {
    var _this;
    _classCallCheck(this, CoarseList);
    _this = _super.call(this);
    _this.lock = new AsyncLock();
    _this.head = new Node(MIN_VALUE);
    _this.head.next = new Node(MAX_VALUE);
    _this.size = 2;
    return _this;
  }
  _createClass(CoarseList, [{
    key: "add",
    value: function add(item) {
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
      this.lock.acquire("this", function (done) {
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
  }, {
    key: "remove",
    value: function remove(item) {
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
      }).then(function (ret) {
        //unlock here
      }, function (err) {
        throw new Error("Error");
      });
    }
  }]);
  return CoarseList;
}(LinkedList);
var OptimisticList = /*#__PURE__*/function (_LinkedList2) {
  _inherits(OptimisticList, _LinkedList2);
  var _super2 = _createSuper(OptimisticList);
  function OptimisticList() {
    var _this2;
    _classCallCheck(this, OptimisticList);
    _this2 = _super2.call(this);
    _this2.lock = new AsyncLock();
    _this2.head = new Node(MIN_VALUE);
    _this2.head.next = new Node(MAX_VALUE);
    _this2.size = 2;
    return _this2;
  }
  _createClass(OptimisticList, [{
    key: "add",
    value: function add(item) {
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
        this.lock.acquire(["pred", "curr"], function (done) {
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
        }, function (err, ret) {
          if (err) {
            throw new Error(err);
          }
          isLoop = false;
        });
      }
    }
  }, {
    key: "remove",
    value: function remove(item) {
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
        this.lock.acquire(["pred", "curr"], function (done) {
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
        }, function (err, ret) {
          if (err) {
            throw new Error(err);
          }
          isLoop = false;
        });
      }
    }
  }, {
    key: "contains",
    value: function contains(item) {
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
        this.lock.acquire(["pred", "curr"], function (done) {
          if (validate(pred, curr)) {
            done("", curr.key == key);
          } else {
            done("FAILED");
          }
        }, function (err, ret) {
          if (err) {
            throw new Error(err);
          }
          isLoop = false;
        });
      }
    }
  }, {
    key: "validate",
    value: function validate(pred, curr) {
      var node = this.head;
      while (node.key <= pred.key) {
        if (node == pred) {
          return pred.next == curr;
        }
        node = node.next;
      }
      return false;
    }
  }]);
  return OptimisticList;
}(LinkedList);
var LazyList = /*#__PURE__*/function (_LinkedList3) {
  _inherits(LazyList, _LinkedList3);
  var _super3 = _createSuper(LazyList);
  function LazyList() {
    var _this3;
    _classCallCheck(this, LazyList);
    _this3 = _super3.call(this);
    _this3.lock = new AsyncLock();
    _this3.head = new Node(MIN_VALUE);
    _this3.head.next = new Node(MAX_VALUE);
    _this3.size = 2;
    return _this3;
  }
  _createClass(LazyList, [{
    key: "add",
    value: function add(item) {
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
        this.lock.acquire(["pred", "curr"], myFN, function (err, ret) {
          if (err) {
            throw new Error(err);
          }
          isLoop = false;
        });
        GLOBALLOCK.acquire(["pred", "curr"], myFN, function (err, ret) {
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
  }, {
    key: "remove",
    value: function remove(item) {
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
        this.lock.acquire(["pred", "curr"], function (done) {
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
        }, function (err, ret) {
          if (err) {
            throw new Error(err);
          }
          isLoop = false;
        });
      }
    }
  }, {
    key: "contains",
    value: function contains(item) {
      var self = this;
      var key = hashCode(item);
      var curr = this.head;
      while (curr.key < key) {
        curr = curr.next;
        return curr.key == key && !curr.marked;
      }
    }
  }, {
    key: "validate",
    value: function validate(pred, curr) {
      return !pred.marked && !curr.marked && pred.next == curr;
    }
  }]);
  return LazyList;
}(LinkedList);
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
setTimeout(function () {
  mylazy.printList();
}, 2000);