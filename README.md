LockTracer is a program designed using [Jalangi2](https://github.com/Samsung/jalangi2) to create a trace of major events when a lock is used in a program. Specifically, [Async-lock](https://github.com/rogierschouten/async-lock) is currently required to be used by the program in order to be fully analyzed by LockTracer. LockTracer does not require the user to make any modifications to their code in order to instrument or trace the events.

The tracer will log all READ and WRITE events for global variables and objects. In addition, LOCK and UNLOCK events that occur using Async-lock are logged.

Use of re-entrant version of Async-lock is allowed but discouraged. LOCK and UNLOCK events for this type of lock will not be traced.


## Setup
All that is required to run LockTracer is to make sure [Babel](https://babeljs.io/) is installed. Babel is a tool that will transpile current JavaScript code into ECMAScript 5.1, which is required for Jalangi2 to instrument the code. Installing Babel can be done with the following command:
```bash
npm install --save-dev @babel/core @babel/cli @babel/preset-env
```

## Usage
LockTracer is run by simply using the command:

```bash
bash runJalangi.sh
```

This will cause some prompts to appear the user must answer. The first prompt will ask for the `source folder`, the folder where the code to be analyzed is located. The program will transpile all of the code and put it into a second folder using Babel. The user will be asked for the `output folder`, which is where all of the transpiled code will go. NOTE: THE OUTPUT FOLDER SHOULD BE EMPTY AS EVERYTHING IN THE FOLDER SELECTED WILL BE DELETED. This is done to avoid many transpiled files from being created due to repeated usage.

Once the files have been transpiled, the user will be asked which file they would like to analyze. The path entered to the file can originate from the 'source folder' or from the root of this program (both can be handled). An example of three equivalent inputs are seen as follows:

```bash
myFile.js
whatever_the_path_is/sourcefolder/myFile.js
whatever_the_path_is/outputfolder/myFile.js
```

Entering a valid file will cause an analysis to occur with the output appended to `output.txt`. An invalid file will inform the user an invalid file was entered. In both cases, the program will ask the user for another file to analyze. This cycle, and the program, can be ended by entering `Done` when a file name is requested.

Alternatively, the user can enter the requested folders as arguments when starting the program.

```bash
bash runJalangi.sh path/to/sourceFolder different/pathTo/outputFolder
```

Finally, in the case where the `source folder` has many nested sub-directories, there is a depth limit of how many subdirectories will be transpiled. The default limit is `4`. But this can be changed using an additional argument when running the program both when the paths to the folders are used as arguments and when not:

```bash
bash runJalangi.sh 7
```

```bash
bash runJalangi.sh path/to/sourceFolder different/pathTo/outputFolder 7
```

These will both set the depth limit of transpiling to `7`.

## Results
Once a file has been analyzed, the results of the trace will be output the the file `output.txt`. This file will mark when a file begins its analysis with each line of the file representing a different event detected.

Each event output has the follwing pattern:
thread number, event type, object ID, file name:line number:colmn number, counter

The thread number represents which thread on which the event took place. Currently, this always 1 as JS is single-threaded in NodeJS. The event type can be READ (RD), WRITE (WR), LOCK (LK), or UNLOCK (UK). The object ID is the number of the object. Each global variable and object will have their own object ID that is constant whenever the variable or object is detected. The exception is with lock objects as LK and UK events will have a different object ID number from the lock object. LK and UK events depend on the lock-key combination; if a lock is reused with the same key then the object ID will be the same. The file location, line number, and column number indicate exactly where the event took place. The counter simply increases by one for each step.

Note that `index.js` may appear as a file location for LK and UK events. This means a batch lock was analyzed (one lock with an array of keys) which Async-lock automatically converts into many nested single locks (only one key). These newly converted single locks are created in Async-lock and so are marked as having originated from there. The final LK and UK event of a batch lock will use the user's code and thus will not have a file location of `index.js`.

An example of experiments can be found in the `experiments` folder along with the main analysis file.

## Diagram
![alt text](./architecture-LockTracer.png?raw=true)

##Versions Used
Bash: version 3.2.57
NodeJS: version 16.15.0