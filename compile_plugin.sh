unwanted_folders="node_modules .git .gitignore package-lock.json src";
mkdir ./vz-user-quotes/;

for folder in ./*; do
  if [[ -d $folder ]]; then
    folder_name=$(basename $folder);
    if [[ "vz-user-quote-single" != *$folder_name* ]]; then
      if [[ "vz-user-quotes" != *$folder_name* ]]; then
        cp -r $folder ./vz-user-quotes/$folder_name;
      fi
    fi
  fi
done

for file in ./*; do
  if [[ -f $file ]]; then
    file_name=$(basename $file);
    if [[ "compile_plugin.sh" != *$file_name* ]]; then
      cp $file ./vz-user-quotes/$file_name;
    fi
  fi
done

cd ./vz-user-quotes/;
mkdir ./vz-user-quote-single/;

for folder in ../vz-user-quote-single/*; do
  if [[ -d $folder ]]; then
    folder_name=$(basename $folder);
    if [[ "node_modules" != *$folder_name* ]]; then
      if [[ "src" != *$folder_name* ]]; then
        cp -r $folder ./vz-user-quote-single/$folder_name;
      fi
    fi
  fi
done

cd ../;
zip -r vz-user-quotes.zip ./vz-user-quotes/;
rm -rf ./vz-user-quotes/;