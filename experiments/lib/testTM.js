"use strict";

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var AsyncLock = require('../../async-lock/index.js');
var GLOBALLOCK = new AsyncLock();
MIN_VALUE = 0;
MAX_VALUE = 1000000;
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
var waitSimple = function waitSimple(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};
THREADINDEX = 1;
THREADLOCALS = {};
var ThreadLocal = /*#__PURE__*/function () {
  function ThreadLocal(transaction) {
    _classCallCheck(this, ThreadLocal);
    this.ID = THREADINDEX;
    THREADINDEX++;
    THREADLOCALS[this.ID] = this;
    this.local = transaction;
  }
  _createClass(ThreadLocal, [{
    key: "getLocal",
    value: function getLocal() {
      return this.local;
    }
  }, {
    key: "setLocal",
    value: function setLocal(transaction) {
      this.local = transaction;
    }
  }]);
  return ThreadLocal;
}();
var Transaction = /*#__PURE__*/function () {
  function Transaction() {
    var myStatus = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'ACTIVE';
    _classCallCheck(this, Transaction);
    this.status = myStatus;
  }
  _createClass(Transaction, [{
    key: "getStatus",
    value: function getStatus() {
      return this.status;
    }
  }, {
    key: "commit",
    value: function commit() {
      if (this.status == 'ACTIVE') {
        this.status = 'COMMITTED';
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: "abort",
    value: function abort() {
      if (this.status == 'ACTIVE') {
        this.status = 'ABORTED';
        return true;
      } else {
        return false;
      }
    }
  }]);
  return Transaction;
}();
var ContentionManager = /*#__PURE__*/function () {
  function ContentionManager() {
    _classCallCheck(this, ContentionManager);
    var MIN_DELAY = 0;
    var MAX_DELAY = 5;
    var previous = null;
    var delay = MIN_DELAY;
  }
  _createClass(ContentionManager, [{
    key: "getRandomInt",
    value: function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }
  }, {
    key: "resolve",
    value: function resolve(me, other) {
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
  }]);
  return ContentionManager;
}();
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
var Node = /*#__PURE__*/_createClass(function Node(element) {
  _classCallCheck(this, Node);
  this.element = element;
  this.key = hashCode(element);
  this.next = null;
});
var LinkedList = /*#__PURE__*/function () {
  function LinkedList() {
    _classCallCheck(this, LinkedList);
    this.head = null;
    this.size = 0;
  }
  _createClass(LinkedList, [{
    key: "add",
    value: function add(element) {
      var node = new Node(element);
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
    value: function insertAt(element, index) {
      if (index < 0 || index > this.size) return console.log("Please enter a valid index.");else {
        var node = new Node(element);
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
        return curr.element;
      }
    }
  }, {
    key: "removeElement",
    value: function removeElement(element) {
      var current = this.head;
      var prev = null;
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
  }, {
    key: "indexOf",
    value: function indexOf(element) {
      var count = 0;
      var current = this.head;
      while (current != null) {
        if (current.element === element) return count;
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
        str += curr.element + " ";
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
    _this.head = new Node(MIN_VALUE);
    _this.head.next = new Node(MAX_VALUE);
    _this.size = 2;
    return _this;
  }
  _createClass(CoarseList, [{
    key: "copyTo",
    value: function copyTo(otherList) {
      otherList.head = JSON.parse(JSON.stringify(this.head));
      otherList.head.key = JSON.parse(JSON.stringify(this.head.key));
      otherList.head.element = JSON.parse(JSON.stringify(this.head.element));
      otherList.head.next = JSON.parse(JSON.stringify(this.head.next));
      otherList.size = JSON.parse(JSON.stringify(this.size));
    }
  }, {
    key: "add",
    value: function add(item) {
      var self = this;
      var pred, curr;
      var key = hashCode(item);
      GLOBALLOCK.acquire("this", function (done) {
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
      }, function (err, ret) {
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
  }, {
    key: "remove",
    value: function remove(item) {
      var self = this;
      var pred, curr;
      var key = hashCode(item);
      GLOBALLOCK.acquire("this", function (done) {
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
      }, function (err, ret) {
        //unlock here
        if (err) {
          throw new Error("Error");
        }
      });
    }
  }]);
  return CoarseList;
}(LinkedList);
var TCoarseList = /*#__PURE__*/function (_CoarseList) {
  _inherits(TCoarseList, _CoarseList);
  var _super2 = _createSuper(TCoarseList);
  function TCoarseList() {
    var _this2;
    _classCallCheck(this, TCoarseList);
    _this2 = _super2.call(this);
    _this2.atomic = new FreeObject();
    return _this2;
  }
  _createClass(TCoarseList, [{
    key: "add",
    value: function add(item) {
      var self = this;
      return atomically(function () {
        self.atomic.openWrite().add(item);
      });
    }
  }, {
    key: "remove",
    value: function remove(item) {
      var self = this;
      return atomically(function () {
        self.atomic.openWrite().remove(item);
      });
    }
  }, {
    key: "size_of_list",
    value: function size_of_list() {
      var self = this;
      return atomically(function () {
        self.atomic.openRead().size_of_list();
      });
    }
  }, {
    key: "printList",
    value: function printList() {
      var self = this;
      return atomically(function () {
        self.atomic.openRead().printList();
      });
    }
  }]);
  return TCoarseList;
}(CoarseList);
var Locator = /*#__PURE__*/_createClass(function Locator() {
  _classCallCheck(this, Locator);
  this.owner = localTransaction.getLocal(); //transaction
  this.oldVersion = new CoarseList();
  this.newVersion = new CoarseList();
});
var FreeObject = /*#__PURE__*/function () {
  function FreeObject() {
    _classCallCheck(this, FreeObject);
    this.start = new Locator();
  }
  _createClass(FreeObject, [{
    key: "openWrite",
    value: function openWrite() {
      me = localTransaction.getLocal();
      switch (me.getStatus()) {
        case 'COMMITTED':
          return this.start.newVersion;
        //it was current start's new version
        case 'ABORTED':
          throw new Error();
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
            } catch (ex) {
              throw new PanicException(ex);
            }
            newLocator.oldVersion.copyTo(newLocator.newVersion);
            if (this.start == oldLocator) {
              this.start = newLocator;
              return newLocator.newVersion;
            }
          }
          me.abort();
          throw new Error();
        default:
          throw new PanicException("Unexpected transaction state");
      }
    }
  }, {
    key: "openRead",
    value: function openRead() {
      me = localTransaction.getLocal();
      switch (me.getStatus()) {
        case 'COMMITTED':
          return this.start.newVersion;
        //it was current start's new version
        case 'ABORTED':
          throw new Error();
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
            } catch (ex) {
              throw new PanicException(ex);
            }
            newLocator.oldVersion.copyTo(newLocator.newVersion);
            if (this.start == oldLocator) {
              this.start = newLocator;
              return newLocator.newVersion;
            }
          }
          me.abort();
          throw new Error();
        default:
          throw new PanicException("Unexpected transaction state");
      }
    }
  }, {
    key: "validate",
    value: function validate() {
      if (localTransaction.getLocal().getStatus() == 'ACTIVE') {
        return true;
      } else {
        return false;
      }
    }
  }]);
  return FreeObject;
}();
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