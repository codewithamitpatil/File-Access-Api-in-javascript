// select multiple files for uploading
//and reading

(async function () {
  const textArea = document.querySelector(".prevBox");
  const selectFiles = document.querySelector("#selectFiles");
  const selectFile = document.querySelector("#selectFile");
  const selectDir = document.querySelector("#selectDir");
  const selectDirs = document.querySelector("#selectDirs");

  // only multiple files
  const selectMultipleFiles = async () => {
    const ResBucket = [];
    const fileHandles = await window.showOpenFilePicker({
      types: [
        {
          description: "Only Images",
          accept: {
            "image/*": [".png", ".gif", ".jpeg", ".jpg"],
            "plain/*": [".txt", ".js"],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: true,
    });

    fileHandles.forEach(async (item) => {
      const file = await item.getFile();
      ResBucket.push(file);
    });
    return ResBucket;
  };

  const selectSingleFile = async () => {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "Only Images",
          accept: {
            "image/*": [".png", ".gif", ".jpeg", ".jpg"],
            "plain/*": [".txt", ".js"],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    });

    const { kind, name } = fileHandle;
    const file = await fileHandle.getFile();

    const resObj = {
      name,
      kind,
      file,
      fileHandle,
    };

    return resObj;
  };

  async function listAllFilesAndDirs(dirHandle) {
    let files = [];
    let Dir = "";

    for await (let [name, handle, isFile] of dirHandle) {
      const { kind } = handle;

      if (handle.kind === "directory") {
        files.push({
          name,
          handle,
          kind,
        });

        files.push(...(await listAllFilesAndDirs(handle)));
      } else {
        files.push({
          name,
          handle,
          kind,
        });
      }
    }
    return files;
  }

  // only single directory along with files
  const selectDirectory = async () => {
    // it will returns FileSystemDirectoryHandle
    const ResBucket = [];
    const dirHandle = await window.showDirectoryPicker();

    for await (const [key, value] of dirHandle.entries()) {
      const { kind, name } = value;
      if (kind === "file") {
        const file = await value.getFile();
        ResBucket.push({ type: "file", file });
      } else if (kind === "directory") {
        const dir = await listAllFilesAndDirs(value);
        ResBucket.push({ name, dir, type: "dir" });
      }
    }
    return { dirname: dirHandle.name, ResBucket };
  };

  // multiple directory along with files

  const dropFileHandle = async (dataObj) => {
    const ResBucket = [];

    for await (const [key, item] of Object.entries(dataObj)) {
      //entry returns FileSystemDirectoryHandle

      (async function () {
        let entry = await item.getAsFileSystemHandle();

        if (entry.kind === "directory") {
          let filesList = await listAllFilesAndDirs(entry);

          ResBucket.push({
            type: entry.kind,
            name: entry.name,
            filesList,
          });
        } else {
          let file = await entry.getFile();

          ResBucket.push({
            type: entry.kind,
            name: entry.name,
            file,
          });
        }
      })();
    }
    console.log(ResBucket);
    return ResBucket;
  };

  selectFiles.addEventListener("click", async () => {
    /**    * 
    it will returns an array of file objects
    so i can read or upload file
    */
    const FilesArr = await selectMultipleFiles();
    console.log(FilesArr);
  });

  selectFile.addEventListener("click", async () => {
    /**    it will returns an object consists of
    name,    kind,    file,    fileHandle,
    */
    const FileObj = await selectSingleFile();
    console.log(FileObj);
  });

  selectDir.addEventListener("click", async () => {
    /**    * 
    it will returns an array of file objects
    so i can read or upload file
    */
    console.log("called");
    const FilesArr = await selectDirectory();
    console.log(FilesArr);
  });

  selectDirs.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  selectDirs.addEventListener("drop", async (e) => {
    e.preventDefault();
    const dataObj = await dropFileHandle(e.dataTransfer.items);
    console.log(dataObj);
  });
})();
