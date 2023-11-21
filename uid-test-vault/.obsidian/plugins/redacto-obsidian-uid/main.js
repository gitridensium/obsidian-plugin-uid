const { Plugin } = require("obsidian");

//name of the folder containig the special index files
//UID frontmatter field is called "index" !!!
const index_folder_name = "_index";

class UIDCreatorPlugin extends Plugin {
  async onload() {
    // Register an event listener for when a new file is opened.
    this.app.workspace.on("file-open", this.handleFileOpen.bind(this));
  }

  handleFileOpen(file) {
    // On open wil start indenxing function.
    // as images and other attachments cannot have frontmatter will parse separate
    // there is ways to write into attachments files directly but is not universal aproach and is much more complicated
    // so if index folder is deleted attachments uids are lost
    // markdown files keep uid as it is in the frontmatter and if move to anothe vault if click will create new index file
    // as Obsidian has option for auto correct links when changes so index files in index folders will be always actual
    if (file.extension == "md") {
      this.indexMarkdown(file);
    } else {
      this.indexAttacments(file);
    }
  }

  indexMarkdown(file) {
    // get opened file metadata
    const file_metadata = this.app.metadataCache.getFileCache(file);

    //get index fm if no null
    //UID frontmatter field is called "index" !!!
    const index = file_metadata?.frontmatter?.index ?? null;

    if (!index) {
      // if index in metadata null then set one
      this.setIndex(file);
    }
  }

  async setIndex(file) {
    //as there is link to that special index file
    //will create it to prevent indexing of index file
    //index files will have in front matter index: self
    //and will use them in futire for diff purposes for data linked to the original file
    // will make index file in index folder with name as uid and return thay uid

    const uid = await this.createIndexFile(file);

    // will set now in fronmtatter index: link to that index file with some alias to not look ugly with that long uid name
    // [[<index folder>>/<index file with name which is our uid>|some alias for pretty look]]
    // in the future that alias can provide some aditional info idk
    this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      const index_file_path = `${index_folder_name}/${uid}`;
      frontmatter["index"] = `[[${index_file_path}|indexed]]`;
    });
  }

  // create index file as mention need to be created to prevent incidental indexinf of that index files
  async createIndexFile(file) {
    // Create a index UID with the current timestamp, and a random number
    const inputString = `${Date.now()}${Math.random()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(inputString);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // hashHex -> uid
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    //for easy reading add ext to uid
    const uid = `${file.extension}_${hashHex}`;
    //check for index folder
    const index_folder =
      this.app.vault.getAbstractFileByPath(index_folder_name);
    if (!index_folder) {
      this.app.vault.createFolder(index_folder_name);
    }

    const index_file_path = `${index_folder_name}\\${uid}.md`;
    const index_file_content = `---\nindex: self\n---\n[[${file.path}]]\n`;
    this.app.vault.create(index_file_path, index_file_content);
    return uid;
  }

  indexAttacments(file) {
    // to check if attachment is indexed
    // will check if is in links in file in the special index folder

    const linked_files = this.searchInResolvedLinks(file.path);
    const hasIndexPrefix = linked_files.some((element) =>
      element.startsWith(index_folder_name)
    );
    //if no file in index folder has link to that attachment then make one
    if (hasIndexPrefix == false) {
      this.createIndexFile(file);
    }
  }

  searchInResolvedLinks(nestedKeyToFind) {
    const links = this.app.metadataCache.resolvedLinks;
    const topLevelKeys = [];

    // Iterate over each top-level key and nested object in the dictionary
    for (const [topLevelKey, nestedObject] of Object.entries(links)) {
      // Check if the nested object contains the nestedKeyToFind
      if (nestedObject.hasOwnProperty(nestedKeyToFind)) {
        topLevelKeys.push(topLevelKey);
      }
    }

    return topLevelKeys;
  }
}

module.exports = UIDCreatorPlugin;
