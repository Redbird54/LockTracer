(function(){
    const fs = require('fs');
    var idNumb = 1;
    var counter = 1;
    var map = new Map();
    var myLockAndKeys = new Map();
    var myLockFuncs = {};
    var batchCbUnlock = false;
    var ignoreNested = false;

function getLocation(iid) {
    return J$.iidToLocation(J$.getGlobalIID(iid)).split('/').slice(-1).join('/').split(':').slice(0,-2).join(':');
}

function getLocationMap(iid) {
    return getLocation(iid).split(':').slice(0,-2).join(':');
}

    J$.analysis = {
        read : function read(iid, name, val, isGlobal, isScriptLocal) {
            var methodLocation = getLocation(iid);
            var methodLocationMap = getLocationMap(iid);
            if (typeof(val) != 'function' && map.get(name+methodLocationMap) && methodLocationMap != "index.js" && (isGlobal || isScriptLocal)) {     
                //read           
                output = "1, RD, "+map.get(name+methodLocationMap)+", "+methodLocation+", "+counter;
                fs.appendFileSync('output.txt', output+"\n");
                // console.log(name+": "+output);
                counter++;
            }
        },
                 
        write : function write(iid, name, val, lhs, isGlobal, isScriptLocal) {
            var methodLocation = getLocation(iid);
            var methodLocationMap = getLocationMap(iid);
            if (name == "resolvedMarker" && methodLocationMap == "index.js") {
                //unlock promise
                output = "1, UK, "+myLockAndKeys.get(val.globalSelf)[val.globalKey]+", "+methodLocation+", "+counter;
                fs.appendFileSync('output.txt', output+"\n");
                // console.log("MYPROMISE: "+output);
                counter++;
            }
            if (name == "runningFunc" && methodLocationMap == "index.js") {
                //valid usersDone about to occur
                batchCbUnlock = true;
            }
            if (name == "nestedMarker" && methodLocationMap == "index.js") {
                //invalid nestedAcquire about to occur
                ignoreNested = true;
            }
            if (name == "decreaseCounter" && methodLocationMap == "index.js" && Array.isArray(val)) {
                //error occurred, no lock or unlock will happen
                myLockFuncs[val[0]][1]--;
                if (val[1]) {
                    myLockFuncs[val[1]][1]--;
                }
            }
            if ((isGlobal || isScriptLocal) && methodLocationMap != "index.js" && typeof(val) != 'function') {
                //write
                if (!map.get(name+methodLocationMap)) {
                    map.set(name+methodLocationMap, idNumb);
                    output = "1, WR, "+idNumb+", "+methodLocation+", "+counter;
                    idNumb++;
                } else {
                    output = "1, WR, "+map.get(name+methodLocationMap)+", "+methodLocation+", "+counter;
                }
                fs.appendFileSync('output.txt', output+"\n");
                // console.log(name+": "+output);
                counter++;
            }
        },
        
        functionEnter : function functionEnter(iid, f, dis, args) {
            var methodLocation = getLocation(iid);
            var methodLocationMap = getLocationMap(iid);
            if (f.name == "acquire" && typeof(args[0]) == 'string' && methodLocationMap == "index.js") {
                //lock has occurred
                if (!myLockAndKeys.get(dis)) {
                    myLockAndKeys.set(dis, {});
                }
                if (!myLockAndKeys.get(dis)[args[0]]) {
                    myLockAndKeys.get(dis)[args[0]] = idNumb;
                    idNumb++;
                }

                //if cb function exists, add to lock funcs, or increase the count if already in lock funcs
                if(args[2]) {
                    if (!myLockFuncs[args[2]]) {
                        myLockFuncs[args[2]] = ["cb", 1];
                    } else {
                        myLockFuncs[args[2]][1]++;
                    }
                }

                //add to lock funcs, or increase the count if already in lock funcs
                if (!myLockFuncs[args[1]]) {
                    myLockFuncs[args[1]] = ["fn", 1];
                } else {
                    myLockFuncs[args[1]][1]++;
                }                
            }

            if (myLockFuncs[f] && myLockFuncs[f][1] > 0  && !dis.globalLocked) {
                myLockFuncs[f][1]--;
            }

            if (f.name == "nestedAcquire" && ignoreNested) {
                ignoreNested = false;
            } else if (myLockFuncs[f] && myLockFuncs[f][1] > 0 && dis.globalSelf && dis.globalLocked && (f.name != "usersDone" || batchCbUnlock)) {
                //valid lock function has occurred
                if (f.name == "usersDone") {
                    batchCbUnlock = false;
                }   
                var myID = myLockAndKeys.get(dis.globalSelf)[dis.globalKey];
                if (myLockFuncs[f][0] == "fn") {
                    //lock
                    output = "1, LK, "+myID+", "+methodLocation+", "+counter;
                    // console.log("MYFN: "+output);
                }
                else {
                    //callback unlock
                    output = "1, UK, "+myID+", "+methodLocation+", "+counter;
                    // console.log("MYCB: "+output);
                }
                fs.appendFileSync('output.txt', output+"\n");
                counter++;
                myLockFuncs[f][1]--;
            }
        }, 

        declare : function declare(iid, name, val, isArgument, argumentIndex, isCatchParam) {
            if (!isArgument && !isCatchParam  && typeof(val) != 'function') {
                var methodLocation = getLocation(iid);
                var methodLocationMap = getLocationMap(iid);
                if (!map.get(name+methodLocationMap) && methodLocationMap != "index.js") {
                    map.set(name+methodLocationMap, idNumb);
                    idNumb++;
                }
            }
        }
    };

}());