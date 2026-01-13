---
title: "SharePoint Document Migration"
date: 2019-06-28T14:08:54
slug: sharepoint-document-migration
wayback_timestamp: 20190628140854
original_permalink: https://jeffbreece.com/sharepoint-document-migration/
---
[Home](https://web.archive.org/web/20190628140854/https://jeffbreece.com/) › [sharepoint](https://web.archive.org/web/20190628140854/https://jeffbreece.com/category/sharepoint/) › SharePoint Document Migration

# SharePoint Document Migration

__Posted on[ October 28, 2015](https://web.archive.org/web/20190628140854/https://jeffbreece.com/sharepoint-document-migration/ "SharePoint Document Migration") by [![](https://web.archive.org/web/20190628140854im_/https://secure.gravatar.com/avatar/e0ec49ea47c3c9e70f0f0098fd1a4d12?s=32&d=mm&r=g)Jeff Breece](https://web.archive.org/web/20190628140854/https://jeffbreece.com/author/jeff/ "View all posts by Jeff Breece") Posted in [sharepoint](https://web.archive.org/web/20190628140854/https://jeffbreece.com/category/sharepoint/) — [No Comments ↓](https://web.archive.org/web/20190628140854/https://jeffbreece.com/sharepoint-document-migration/#respond)

I worked with a legal department about 6 years ago. These folks had dug themselves into a Windows file share hole for over a decade. Arguably the assistant could rifle through it like a pro, however none of the other staff members knew where to start without her. Our challenge was to migrate all these digital assets into SharePoint with a more thoughtful architecture.

Some of the most common situations I’ve run into include clients who have structures either like these or were moving from a custom built DMS or WordPress. They typically want the file structures, documents and tags to be replicated on the SharePoint side.

One way to add intelligence into this process is to leverage user surveys designed by UX experts. These can provide valuable insight toward both identifying specific sets of documents along with providing a rich platform for organization and content search. One of the questions you want to ask is “does this file merit the cost of keeping?” Another one to ask becomes _when_ is it appropriate for a document to expire? Is there a need to keep a given document for the sake of retention?

Our example below makes use of PowerShell. There are however great third party tools like [Metalogix](https://web.archive.org/web/20190628140854/http://www.metalogix.com/) which make this process much easier. Metalogix comes with a scaling cost so the smaller your collection of data the lower the cost. There is of course straight up “Explorer View” in SharePoint through [WebDav](https://web.archive.org/web/20190628140854/https://en.wikipedia.org/wiki/WebDAV). The caveats with this include a limit of files that can be moved through this mechanism and the inability to do any form of dynamic metadata conversion.

Some jobs are so involved that they preclude the use of anything besides a little custom scripting. PowerShell utilities makes traversing the network share, folder by folder/item by item, pretty straight forward. You may want to target MS Office documents, CAD drawings and image file formats therefore we filter by extension. You may also want to automatically populate information from the folder hierarchy using the folder path names. This could be used to ease the transition for users who want to leverage search or maintain a consistent folder like views in SharePoint.

It was while working with a recent client we developed a couple scripts taking a phased approach. One was simply a reuse of the thought process behind the legal department project. The second was to actually match on document file name between a corresponding csv file and the actual file objects on the file system. With this we were able to not only perform a file migration but also populate a number of custom site columns. The second part may be helpful to those migrating from other DMS platforms where documents may have a set of meta-data that would be valuable to move over into SharePoint.

In the first code example you’ll find how we read in all the files from a prepopulated file repository (or extract in the case of a secondary DMS). The code iterates over the collection, get each file, sanitize name (remove [illegal characters](https://web.archive.org/web/20190628140854/https://support.microsoft.com/en-us/kb/905231)) and finally create new [SPFile](https://web.archive.org/web/20190628140854/https://msdn.microsoft.com/library/Microsoft.SharePoint.SPFile) objects with corresponding basic site column information.
    
    
    $snapin = Get-PSSnapin|Where-Object{$_.Name -eq 'Microsoft.SharePoint.Powershell'}
    if ($snapin -eq $null)
    {
     Write-Host "Loading SharePoint Powershell Snap-in";
     Add-PSSnapin "Microsoft.SharePoint.Powershell";
    }
    
    # SharePoint
    
    function CreateSPFile($webUrl, $docLibName, $filePath, $folderName)
    {
     $currentDate = Get-Date -format M.d.yyyy;
     $docLibrary = "Documents";
    
    $Web = Get-SPWeb $webUrl;
     $Web.AllowUnsafeUpdates = $true;
     $Web.Update();
     try{
     $List = $web.Lists[$docLibName];
    
    if($folderName -eq "\") { $folderName = "/"; }
    
    $spFolder = $web.getfolder("Documents" + $folderName);
    
    $FileName = $filePath.Substring($filePath.LastIndexOf("\")+1);
    
    #Add file
     $web = Get-SPWeb $webUrl;
     $file = Get-Item $filePath;
    
    #Create file stream object from file
     $fileStream = ([System.IO.FileInfo] (Get-Item $file.FullName)).OpenRead();
     write-host "Copying" $file.Name "to" $docLibrary.Title "in" $web.Title "...";
    
    #Add file
     $folder = $web.getfolder($docLibrary + $folderName);
     $spFile = $folder.Files.Add($folder.Url + "/" + $file.Name,[System.IO.Stream]$fileStream, $true);
     write-host "Success" -foregroundcolor "green";
     $spItem = $spFile.Item;
    
     #$spFile.CheckOut
     # Tag represents a SharePoint site column which will hold the value of the original folder name for basic tagging
     $spItem["Tag"] = $folderName;
     $spItem.SystemUpdate();
     $spFile.CheckIn("Migration CheckIn.", [Microsoft.SharePoint.SPCheckInType]::MajorCheckin);
    
    }
     catch {
     $_.Exception.StackTrace;
     $_.Exception.Message;
     }
     finally{
     $Web.AllowUnsafeUpdates = $false;
     $Web.Update();
     $Web.Dispose();
     $fileStream.Close();
    
     }
     }
    
    function RemoveIllegalCharacters ($Path, [switch]$Verbose)
    {
     Write-Host Checking files in $Path, please wait...
     #Get all files and folders under the path specified
     $items = Get-ChildItem -Path $Path -Recurse
     foreach ($item in $items)
     {
     #Check if the item is a file or a folder
     if ($item.PSIsContainer) { $type = "Folder" }
     else { $type = "File" }
    
     #Report item has been found if verbose mode is selected
     if ($Verbose) { Write-Host Found a $type called $item.FullName }
    
     #Check if item name is 128 characters or more in length
     if ($item.Name.Length -gt 127)
     {
     Write-Host $type $item.Name is 128 characters or over and will need to be truncated -ForegroundColor Red
     }
     else
     {
     #From http://powershell.com/cs/blogs/tips/archive/2011/05/20/finding-multiple-regex-matches.aspx
     $illegalChars = '[&{}~#%]'
     filter Matches($illegalChars)
     {
     $item.Name | Select-String -AllMatches $illegalChars |
     Select-Object -ExpandProperty Matches
     Select-Object -ExpandProperty Values
     }
    
     #Replace illegal characters with legal characters where found
     $newFileName = $item.Name
     Matches $illegalChars | ForEach-Object {
     Write-Host $type $item.FullName has the illegal character $_.Value -ForegroundColor Red
     #These characters may be used on the file system but not SharePoint
     if ($_.Value -match "&") { $newFileName = ($newFileName -replace "&", "and") }
     if ($_.Value -match "{") { $newFileName = ($newFileName -replace "{", "(") }
     if ($_.Value -match "}") { $newFileName = ($newFileName -replace "}", ")") }
     if ($_.Value -match "~") { $newFileName = ($newFileName -replace "~", "-") }
     if ($_.Value -match "#") { $newFileName = ($newFileName -replace "#", "") }
     if ($_.Value -match "%") { $newFileName = ($newFileName -replace "%", "") }
     }
    
     #Check for start, end and double periods
     if ($newFileName.StartsWith(".")) { Write-Host $type $item.FullName starts with a period -ForegroundColor red }
     while ($newFileName.StartsWith(".")) { $newFileName = $newFileName.TrimStart(".") }
     if ($newFileName.EndsWith(".")) { Write-Host $type $item.FullName ends with a period -ForegroundColor Red }
     while ($newFileName.EndsWith(".")) { $newFileName = $newFileName.TrimEnd(".") }
     if ($newFileName.Contains("..")) { Write-Host $type $item.FullName contains double periods -ForegroundColor red }
     while ($newFileName.Contains("..")) { $newFileName = $newFileName.Replace("..", ".") }
     if($item.Name -eq 'Manlift inspection p 1&2.pdf'){
     Write-Host 'Got it';
     }
     #Fix file and folder names if found and the Fix switch is specified
     if (($newFileName -ne $item.Name))
     {
     Rename-Item $item.FullName -NewName ($newFileName)
     Write-Host $type $item.Name has been changed to $newFileName -ForegroundColor Blue
     }
     }
     }
    }
    
    function InitFolder($folderName) {
     $inRoot = $false;
     $web = Get-SPWeb "http://your/sharepoint/site";
     $list = $web.Lists["Documents"];
     $spFolderName = $folderName.ToString().Replace("C:\data\documents\", "\");
    
     $charCount = ($spFolderName.ToCharArray() | Where-Object {$_ -eq '\'} | Measure-Object).Count;
     if($charCount -eq 1) { $inRoot = $true; }
    
    # Create a folder in root
     if($inRoot) {
     $spFolderRoot = $spFolderName.Substring($spFolderName.LastIndexOf("\")+1);
     $spFolderName = $spFolderRoot;
     $folder = $list.ParentWeb.GetFolder($list.RootFolder.Url + "/$spFolderName");
     if (!$folder.Exists -and $spFolderName -ne "\")
     {
     $folder = $list.AddItem("", [Microsoft.SharePoint.SPFileSystemObjectType]::Folder, "$spFolderName");
     $folder.Update();
     Write-Host "Folder created " $folder.Url -ForegroundColor Green;
     }
     }
     #create a sub folder inside of an existing one
     elseif(!$inRoot){
     $spFolderRoot = $spFolderName.Substring(0, $spFolderName.LastIndexOf("\")+1);
     $spFolderName = $folderName.Substring($folderName.LastIndexOf("\")+1);
     $spFolderNameReturn = $spFolderRoot + $spFolderName;
    
    $spFolderRoot = $spFolderRoot.Replace("\", "/");
     $spFolderName = $spFolderName.Replace("\", "/");
    
     # check if exists
     $subFolder = $list.ParentWeb.GetFolder($list.RootFolder.Url + "$spFolderRoot$spFolderName");
     if (!$subFolder.Exists -and $spFolderName -ne "\")
     {
     $folder = $list.ParentWeb.GetFolder($list.RootFolder.Url + "$spFolderRoot");
     $subFolder = $list.AddItem($folder.URL, [Microsoft.SharePoint.SPFileSystemObjectType]::Folder, $spFolderName)
     $subFolder.Update();
     Write-Host "Sub folder created " $folder.Url -ForegroundColor DarkYellow;
     }
     }
     return $spFolderNameReturn;
    }
    
    # Filesystem
    
    function UploadFile($directory, $file) {
     $docLibName = "Documents";
     $fileLocation = $directory;
     $spUrl = "http://your/sharepoint/site";
     $directory = $directory.ToString().Replace("C:\data\documents\", "\");
     $directory = $directory.Substring(0, $directory.LastIndexOf("\")+1);
     $directory = $directory.ToString().Replace("\", "/");
     EnsureFolder $directory;
     if($file.Length -gt 0)
     {
     Write-Host $file -ForegroundColor DarkYellow;
     CreateSPFile $spUrl $docLibName $fileLocation $directory;
     }
    }
    
    function EnsureFolder($folderName) {
     if($folderName -eq "uploads")
     {
     $folderName = "/";
     }
     Write-Host $folderName -ForegroundColor cyan
    }
    
    function ProcessAll() {
     $from = "C:\data\documents\";
     RemoveIllegalCharacters($from);
    
    $folderAssets = Get-ChildItem -Recurse $from | ?{ $_.PSIsContainer } | Select-Object FullName
     foreach ($folder in $folderAssets)
     {
     $dir = $folder.FullName;
     if(($dir -eq $null -or $dir -eq "")) { $dir = $file; $file = ""; }
     $dir = InitFolder($dir);
     }
     $fileAssets = Get-ChildItem -Recurse $from | ?{ !$_.PSIsContainer } | Select-Object FullName
    
    foreach ($fileAsset in $fileAssets)
     {
     $dir = $fileAsset.FullName;
     $file = $dir.Substring($dir.LastIndexOf("\")+1);
     if(($dir -eq $null -or $dir -eq "")) { $dir = $file; $file = ""; }
     UploadFile $dir $file;
     }
    }
    
    # Command Chain
    $startDTM = (Get-Date)
    ProcessAll
    $endDTM = (Get-Date)
    "Elapsed Time: $(($endDTM-$startDTM).totalseconds) seconds"
    

The second code example reads from a pre-built CSV file containing metadata information per file with a key of filename as a string. This can either be an export from an external system or a manually compiled list. I know. I thought about the effort here too which is why I always recommend we go the organic route once in SharePoint. It is, at times, important to the client to surface this info so similar list views can be replicated easing the adoption process. In the end it’s a choice of client requirements.
    
    
    [System.Reflection.Assembly]::LoadWithPartialName("Microsoft.SharePoint")
    if((Get-PSSnapin | Where {$_.Name -eq "Microsoft.SharePoint.PowerShell"}) -eq $null) {
     Add-PSSnapin Microsoft.SharePoint.PowerShell;
     }
    
    # Site
    $WebUrl = "http://your/sharepoint/site";
    
    # Location of your CSV file
    # Example format filename, document classification, document tags
    $documents = IMPORT-CSV "C:\data\file.csv";
    
    function RemoveIllegalCharacters ($fileName)
    {
     #Check if item name is 128 characters or more in length
     if ($fileName.Length -gt 127)
     {
     Write-Host $fileName is 128 characters or over and will need to be truncated -ForegroundColor Red
     }
     else
     {
     $illegalChars = '[&{}~#%]'
    
     #Replace illegal characters with legal characters where found
     $newFileName = $fileName;
     #These characters may be used on the file system but not SharePoint
     $newFileName = ($newFileName -replace "&", "and");
     $newFileName = ($newFileName -replace "{", "(")
     $newFileName = ($newFileName -replace "}", ")")
     $newFileName = ($newFileName -replace "~", "-")
     $newFileName = ($newFileName -replace "#", "")
     $newFileName = ($newFileName -replace "%", "")
    
     #Check for start, end and double periods
     if ($newFileName.StartsWith(".")) { Write-Host $fileName starts with a period -ForegroundColor red }
     while ($newFileName.StartsWith(".")) { $newFileName = $newFileName.TrimStart(".") }
     if ($newFileName.EndsWith(".")) { Write-Host $item.FullName ends with a period -ForegroundColor Red }
     while ($newFileName.EndsWith(".")) { $newFileName = $newFileName.TrimEnd(".") }
     if ($newFileName.Contains("..")) { Write-Host $fileNamee contains double periods -ForegroundColor red }
     while ($newFileName.Contains("..")) { $newFileName = $newFileName.Replace("..", ".") }
    
    #Fix file and folder names if found and the Fix switch is specified
     if (($newFileName -ne $fileName))
     {
     $fileName = $newFileName;
     Write-Host $type $item.Name has been changed to $newFileName -ForegroundColor Blue
     }
     }
     return $fileName;
    }
    
    function UpdateMetaData () {
    
    # Get our item
     $web = Get-SPWeb -Identity $WebUrl;
     $list = $web.Lists["Documents"];
     $query = New-Object Microsoft.SharePoint.SPQuery;
     $query.ViewAttributes = "Scope = 'Recursive'";
     $caml = "<Where><Eq><FieldRef Name='FileLeafRef'/><Value Type=\'File\'>" + $fileName + "</Value></Eq></Where>";
     $query.Query = $caml;
     $query.RowLimit = 1;
     $items = $list.GetItems($query);
     $item = $items[0];
     if($item){
     # Document Classification Site Column
     # SharePoint Choice Field Example
     $ChoiceField = $list.Fields.GetField("DocClass");
     $ChoicesArray = $docType;
    
    $col = $list.Fields["Keywords"];
     $instancesOf = $col.Choices -match $docType;
     if($instancesOf.Length -eq 0){
     $ChoiceField.choices.addrange($ChoicesArray);
     }
     #Commit choice changes
     $ChoiceField.update();
    
     $item["DocType"] = $docType;
     # Document Tags Site Column
     # SharePoint Text Field Example
     $item["Document Tags"] = $keywords;
    
    # Call item update
     $item.SystemUpdate();
     }
    }
    
    # This foreach will loop all the rows in the above data list
    $tagStore = @();
    foreach ($document in $documents) {
     $docClass = $document.DOCLASS;
     $docTagss = $document.DOCTAGS;
     $fileName = $document.DOCNAME;
    
    $fileName = RemoveIllegalCharacters $fileName;
     Write-Host("Attmepting to update: " + $fileName);
     UpdateMetaData;
    
    }
    

It should be noted these scripts could be modified to work with Office 365 and SharePoint Online using REST calls versus the SharePoint API I used.

‹ [Maple Syrup Recovery Drinks and Courage to Change](https://web.archive.org/web/20190628140854/https://jeffbreece.com/maple-syrup-recovery-drinks-and-courage-to-change/)

[A family 15k](https://web.archive.org/web/20190628140854/https://jeffbreece.com/a-family-15k/) ›

Tagged with: [PowerShell](https://web.archive.org/web/20190628140854/https://jeffbreece.com/tag/powershell/), [SharePoint](https://web.archive.org/web/20190628140854/https://jeffbreece.com/tag/sharepoint-2/)  


### Leave a Reply [Cancel reply](/web/20190628140854/https://jeffbreece.com/sharepoint-document-migration/#respond)

Your email address will not be published. Required fields are marked *

Comment

Name *

E-mail *

Website

This site uses Akismet to reduce spam. [Learn how your comment data is processed](https://web.archive.org/web/20190628140854/https://akismet.com/privacy/).
