#!/bin/bash

if [[ $# > 3 || $# < 0 ]]
then
  echo Invalid number of inputs. Please have between 0 and 4 input parameters.
  exit 1
else
  if [[ $(($# % 2)) == 1 ]]
  then
    depth=${@: -1}
  else
    depth=4
  fi
  if [ $# -ge 2 ]
  then
    src=$1
    lib=$2
  else
    echo Input the source folder
    read src
    echo Input the output folder
    read lib
  fi

  #Remove extra / at end of src when applicable
  if [[ "${src: -1}" == "/" ]]
  then
    src="${src::${#src}-1}"
  fi

  #Remove extra / at end of lib when applicable
  if [[ "${lib: -1}" == "/" ]]
  then
    lib="${lib::${#lib}-1}"
  fi

  #Get a count of how many valid / characters in lib
  res="${lib//[^\/]}"
  if [[ $lib == ./* ]]
  then
  count=${#res}
  else
  count=$((${#res}+1))
  fi

  # Create a path with same number of ../ as there are valid / characters in lib
  path=''
  while [[ $count > 0 ]]
  do
  path="${path}..\/"
  count=$(($count-1))
  done


  #Remove previous files and subdirectories for our lib
  rm -r ./$lib/* # more flexible version that requires more precise directory input

  #1) Transpile files in src folder and put new files into lib folder
  ./node_modules/.bin/babel ./$src --out-dir ./$lib --presets=@babel/env 

  copy_folder() {
    if [ "$2" -lt $depth ] #Depth limit of subdirectories
    then
      for entry in $1/*
      do
        cur_file=$echo${entry##*/}
        if [ "$echo${cur_file##*.}" != "js" ]
        then
          if [ -d "$entry" ]
          then
            #Create folder in lib directory and recursively explore this subdirectory
            mkdir -p "${entry/$src/$lib}"
            copy_folder $entry $(($2+1)) "${3}..\/"
          else
            #Copy non-js files to new folder
            path=$echo${entry%/*}
            cp $entry "${path/$src/$lib}" #./experiments/$lib 
          fi
        else
          #2) Replace all instances of importing async-lock with local async-lock in all the new lib files
          sed -i "" "s/require('async-lock')/require('${3}async-lock\/index.js')/g" "${entry/$src/$lib}"  
        fi
      done
    fi
  }

  #Need to have everything copied first
  copy_folder ./$src 0 $path

  #Clear output.txt here
  > output.txt
  while :
  do
    echo Input a file to analyze. Type 'Done' to end program.
    read file
    if [[ "${file}" == "done" || "${file}" == "Done" || "${file}" == "DONE" ]]
    then
      break
    else
    #File was input
      #If input file is long path that includes src path then only keep parts after src
      if [[ $file == $src/* ]]
      then
        temp=$echo${file#"$src"}
        analyze_file=$echo${temp#/}
      #If input file is long path that includes lib path then only keep parts after lib
      elif [[ $file == $lib/* ]]
      then
        temp=$echo${file#"$lib"}
        analyze_file=$echo${temp#/}
      #File input is kept the same
      else
        analyze_file=$file
      fi

      if [[ -f $lib/$analyze_file ]]
      then
        echo "ANALYZING $analyze_file" >> output.txt
        #Path to analysis assumed to be in this path
        #3) Trace file that was input.
        node ./jalangi2/src/js/commands/jalangi.js --inlineIID --inlineSource --analysis ./experiments/analysis.js $lib/$analyze_file
        echo "" >> output.txt
      else
        echo Invalid filename. Please enter a valid filename within: $lib. Be sure to include the filename extention such as '.js'.
      fi
    fi
  done
fi