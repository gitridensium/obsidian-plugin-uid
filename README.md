# Redacto Obsidian UIDs
The purpose of that plugin is to create UIDs for every opened file.

## Markdown files
For the markdown files it will create in the frontmatter UID with key `index`.
That uid will be "embed" in link to special "index" file which will also be created in special "index" folder and as it is SHA1 will also have some alias to look prettier - `[[<index folder>/<uid>|<alias>`
That "index" file also will have link to the original file.
So the UID can be extracted for use in two ways:
- from the fronmatter in original file
- from the link from index file to the original file

## Rest of the files
Images, PDFs, etc. will have also such special index file with link to them, but as there is no common way to write into original files the UID for them will be just there.

## UID
The uid is generated as SHA1 from time and random number and has that pattern `<file extention>_<hashHex from sha1>`. 

## "Index" files
Index files are normal markdown ones too.
To prevent indexing of these special files they have in the frontmatter also key `index` with value `self`

## "Index" folder
That folder contain "index" files. And will be autocreated if not present.

## Settings
There are no settings. The name of index folder "_index" and frontmatter key "index" are hardcoded.

In *Obsidian* it is usefull to set in **Excluded Files** `_index` and or as regex `/_index/.+/` to prevent poping the indexed files in searches and other places where you prefer to see only notes and rest of files you work with.

## JS/TS
As this plugin is for personal use and I can do it in JS it has no TS source. Sorry :)