---
sidebar_position: 2
title: "Basic Commands and Directory Hierarchy"
description: "Master essential Linux commands, directory navigation, file operations, and understand the Unix filesystem hierarchy for effective system administration"
---

import { ProcessFlow, StackDiagram, CardGrid, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# 2. Basic Commands and Directory Hierarchy

This chapter is a guide to the Unix commands and utilities you'll encounter throughout this book.

This is preliminary material, and you may already know a substantial amount of it. Even if you think you're up to speed, take a few moments to flip through the chapter, especially the directory hierarchy material in Section 2.19.

**Why Unix commands?** Isn't this a book about how Linux works?

It is, of course, but Linux is a Unix flavor at heart. The core Unix commands work across Linux, BSD, and other Unix-flavored systems.

This book focuses on core commands rather than Linux-specific extensions because these extensions tend to be unstable. Knowing core commands helps you adapt to new Linux releases and understand the kernel, as many commands correspond directly to system calls.

## 2.1. The Bourne Shell: /bin/sh

**In plain English:** The shell is like a command interpreter or personal assistant. You tell it what you want done (run this program, copy that file), and it makes it happen. It's the command-line interface you type into.

**In technical terms:** A shell is a program that runs commands entered by users into a terminal window. These commands can be other programs or built-in shell features. The shell also serves as a small programming environment.

**Why it matters:** The shell is one of the most important parts of a Unix system. Many system components are actually shell scripts. Mastering the shell gives you powerful control over your system.

### 2.1.1. Shell Scripts

Many important parts of the system are shell scripts - text files containing sequences of shell commands.

If you've worked with MS-DOS previously, think of shell scripts as very powerful .BAT files.

**Advantages of using the shell:**

- If you make a mistake, you can easily see what you typed
- You can learn what went wrong and try again
- You can save command sequences as scripts for reuse
- Unix programmers break tasks into smaller components and use the shell to manage them

### 2.1.2. The Bash Shell

There are many different Unix shells, but all derive features from the **Bourne shell** (`/bin/sh`), a standard shell developed at Bell Labs for early versions of Unix.

Every Unix system needs a version of the Bourne shell to function correctly.

**Linux's shell:**
- Linux uses an enhanced version called **bash** or the "Bourne-again" shell
- Bash is the default shell on most Linux distributions
- `/bin/sh` is normally a link to bash on Linux systems
- You should use bash when running examples in this book

> **Warning**
>
> You may not have bash as your default shell if you're using this chapter as a guide for a Unix account at an organization where you're not the system administrator. You can change your shell with `chsh` or ask your system administrator for help.

## 2.2. Using the Shell

When you install Linux, you should create at least one regular user as your personal account.

For this chapter, you should log in as the regular user (not root).

### 2.2.1. The Shell Window

After logging in, open a shell window (often referred to as a terminal).

**Opening a terminal:**
- From GUI (Gnome/KDE): Open a terminal application
- The terminal starts a shell inside a new window

**Shell prompt format:**

- Ubuntu: `name@host:path$`
- Fedora: `[name@host path]$`

Where:
- `name` is your username
- `host` is your machine name
- `path` is your current working directory

### 2.2.2. Command Format

Commands in this book begin with `$` to denote the shell prompt.

Type only the part in bold, not the `$`:

```bash
$ echo Hello there.
```

**Commands starting with `#`:** These require superuser (root) privileges and need extra caution. Best practice is to use `sudo` to run them (covered in Section 2.20).

**Example command:**

```bash
$ cat /etc/passwd
```

This displays the contents of the `/etc/passwd` system information file, then returns your shell prompt.

### 2.2.3. Command Structure

**In plain English:** Commands are like sentences - they start with a verb (the program name) and have objects (arguments) that tell what to work on and how to do it.

**In technical terms:** Commands usually begin with a program to run and may be followed by arguments that tell the program what to operate on and how to do so.

**Why it matters:** Understanding command structure helps you read documentation, construct commands correctly, and troubleshoot when things go wrong.

**Format:**
```
program [options] [arguments]
```

**Example:**
```bash
$ cat /etc/passwd
```
- Program: `cat`
- Argument: `/etc/passwd`

**Options:**
- Many arguments are options that modify default behavior
- Options typically begin with a dash (`-`)
- Example: `ls -l` (the `-l` is an option)

**Exceptions:**
- Shell built-ins don't always follow this structure
- Temporary environment variable usage has different syntax

## 2.3. Standard Input and Standard Output

**In plain English:** Streams are like pipes that data flows through. Standard input is where data flows in (usually your keyboard), standard output is where results flow out (usually your screen). Programs can read from and write to these pipes.

**In technical terms:** Unix processes use I/O streams to read and write data. Processes read from input streams and write to output streams. Streams are flexible - sources can be files, devices, terminals, or even output from other processes.

**Why it matters:** Understanding streams lets you chain commands together, redirect output to files, and build powerful command pipelines. This is a fundamental Unix capability.

### 2.3.1. Exploring Streams with cat

**The cat program:** Outputs the contents of one or more files or another source of input.

**Basic syntax:**
```bash
$ cat file1 file2 ...
```

**Interactive mode example:**

```bash
$ cat
```

- `cat` waits for input (no shell prompt)
- Type anything and press Enter
- `cat` repeats what you type
- Press `Ctrl-D` on an empty line to exit

**What's happening:**
- Without a filename, `cat` reads from **standard input** (stdin)
- Standard input is connected to your terminal
- `cat` writes to **standard output** (stdout)
- Standard output is connected to your terminal

> **Insight**
>
> Pressing `Ctrl-D` on an empty line sends an EOF (end-of-file) message and often terminates a program. Don't confuse this with `Ctrl-C`, which usually terminates a program regardless of its input or output.

### 2.3.2. Standard Streams

**Three standard I/O streams:**

1. **Standard input (stdin):** Where programs read input
2. **Standard output (stdout):** Where programs write normal output
3. **Standard error (stderr):** Where programs write error messages (covered in Section 2.14.1)

**Common abbreviations:**
- stdin = standard input
- stdout = standard output
- stderr = standard error

**Behavior:**
- Many commands read from stdin if you don't specify input files
- Some programs (like `cat`) send output only to stdout
- Others have options to send output directly to files

**Power of standard streams:**
You can easily manipulate streams to read and write to places other than the terminal (Section 2.14).

## 2.4. Basic Commands

Now let's look at essential Unix commands.

Most programs take multiple arguments and have many options. This is a simplified list of the basics - you don't need all the details just yet.

<CardGrid
  cards={[
    {
      title: 'ls',
      description: 'List directory contents with various formats and details',
      color: colors.blue
    },
    {
      title: 'cp',
      description: 'Copy files and directories to new locations',
      color: colors.green
    },
    {
      title: 'mv',
      description: 'Move or rename files and directories',
      color: colors.orange
    },
    {
      title: 'touch',
      description: 'Create empty files or update timestamps',
      color: colors.purple
    },
    {
      title: 'rm',
      description: 'Remove (delete) files permanently',
      color: colors.red
    },
    {
      title: 'echo',
      description: 'Print text or variables to standard output',
      color: colors.blue
    }
  ]}
/>

### 2.4.1. ls

**In plain English:** The `ls` command shows you what files and folders are in a directory, like looking at a folder in a file browser.

**Purpose:** Lists the contents of a directory.

**Basic usage:**
```bash
$ ls
```

Lists files in the current directory.

**Common options:**

- `ls -l` - Detailed (long) listing
- `ls -F` - Display file type information
- `ls -a` - Show hidden files (those starting with `.`)

**Example long listing:**
```bash
$ ls -l
total 3616
-rw-r--r-- 1 juser users   3804 May 28 10:40 abusive.c
-rw-r--r-- 1 juser users   4165 Aug 13 10:01 battery.zip
drwxr-xr-x 2 juser users   4096 Jul 17 20:00 cs335
-rwxr-xr-x 1 juser users   7108 Jun 16 13:05 dhry
```

**Long listing columns:**

1. **File mode:** Permissions and file type (explained in Section 2.17)
2. **Hard link count:** Number of hard links (explained in Section 4.6)
3. **Owner:** User who owns the file
4. **Group:** Group that owns the file
5. **Size:** File size in bytes
6. **Date/time:** Last modification timestamp
7. **Filename:** Name of the file or directory

### 2.4.2. cp

**In plain English:** Like making a photocopy of a document, `cp` creates a duplicate of a file in a new location or with a new name.

**Purpose:** Copies files.

**Simple file copy:**
```bash
$ cp file1 file2
```
Copies `file1` to `file2`.

**Copy to directory:**
```bash
$ cp file dir
```
Copies `file` to directory `dir`, keeping the same filename.

**Copy multiple files:**
```bash
$ cp file1 file2 file3 dir
```
Copies three files to directory `dir`.

### 2.4.3. mv

**In plain English:** The `mv` command moves files like moving papers from one folder to another, or renames them like relabeling a folder.

**Purpose:** Moves or renames files and directories.

**Rename a file:**
```bash
$ mv file1 file2
```
Renames `file1` to `file2`.

**Move to directory:**
```bash
$ mv file dir
```
Moves `file` to directory `dir`.

**Note:** `mv` works like `cp` for moving multiple files to directories.

### 2.4.4. touch

**In plain English:** Touch is like tapping a file to say "I was here" - it updates the timestamp or creates an empty file if it doesn't exist.

**Purpose:** Creates empty files or updates modification timestamps.

**Create empty file:**
```bash
$ touch file
```

**Check the result:**
```bash
$ ls -l file
-rw-r--r-- 1 juser users 0 May 21 18:32 file
```

Notice the size is 0 bytes and the timestamp shows when you ran `touch`.

**Update timestamp:**
Wait at least a minute and run `touch file` again. The timestamp updates to the current time.

### 2.4.5. rm

**In plain English:** The `rm` command is like using a paper shredder - once you delete a file, it's gone forever (unless you have backups).

**Purpose:** Deletes (removes) files.

**Remove a file:**
```bash
$ rm file
```

> **Warning**
>
> After you remove a file, it's usually gone from your system and generally cannot be undeleted unless you restore it from a backup. Be careful!

### 2.4.6. echo

**In plain English:** Echo is like a parrot - it repeats back whatever you tell it, printing text to your screen.

**Purpose:** Prints arguments to standard output.

**Example:**
```bash
$ echo Hello again.
Hello again.
```

**Useful for:**
- Finding expansions of shell globs (wildcards like `*`)
- Viewing variable values (like `$HOME`)
- Debugging shell scripts

## 2.5. Navigating Directories

**In plain English:** The directory system is like a filing cabinet with folders inside folders. Understanding how to move through this structure is essential for finding and organizing files.

**In technical terms:** The Unix directory hierarchy starts at `/` (root directory). The directory separator is the slash (`/`), not the backslash (`\`). Standard subdirectories exist in the root directory (like `/usr`).

**Why it matters:** Efficient directory navigation is fundamental to Linux usage. Understanding paths (absolute vs. relative) prevents confusion and errors.

### 2.5.1. Paths and Pathnames

**Types of paths:**

**Absolute path (full path):**
- Starts with `/`
- Examples: `/usr/lib`, `/etc/passwd`
- Specifies location from root directory

**Relative path:**
- Doesn't start with `/`
- Examples: `lib`, `../bin`, `./X11`
- Specifies location relative to current directory

**Special directory references:**

- `..` (two dots) - Parent directory
  - If you're in `/usr/lib`, then `..` refers to `/usr`
  - `../bin` refers to `/usr/bin`

- `.` (one dot) - Current directory
  - If you're in `/usr/lib`, then `.` is still `/usr/lib`
  - `./X11` is `/usr/lib/X11`
  - Often optional (many commands default to current directory)

**Example:**

```bash
# Current directory: /usr/lib
.          # Same as /usr/lib
..         # Parent: /usr
../bin     # Sibling: /usr/bin
./X11      # Subdirectory: /usr/lib/X11
X11        # Also /usr/lib/X11 (relative path)
```

### 2.5.2. Essential Directory Commands

<CardGrid
  cards={[
    {
      title: 'cd',
      description: 'Change current working directory',
      color: colors.blue
    },
    {
      title: 'mkdir',
      description: 'Create new directories',
      color: colors.green
    },
    {
      title: 'rmdir',
      description: 'Remove empty directories',
      color: colors.orange
    },
    {
      title: 'pwd',
      description: 'Print current working directory path',
      color: colors.purple
    }
  ]}
/>

### 2.5.3. cd

**In plain English:** The `cd` command is like walking from one room to another in a building - it changes which directory you're currently "in."

**Purpose:** Changes the shell's current working directory.

**Basic usage:**
```bash
$ cd dir
```

**Special cases:**

- `cd` (no argument) - Returns to your home directory
- `cd ~` - Also goes to home directory (tilde is shorthand)
- `cd -` - Goes to previous directory

> **Insight**
>
> The `cd` command is a shell built-in. It wouldn't work as a separate program because if it ran as a subprocess, it couldn't change its parent's current working directory. Understanding this distinction can clear up confusion later.

### 2.5.4. mkdir

**Purpose:** Creates a new directory.

**Usage:**
```bash
$ mkdir dir
```

### 2.5.5. rmdir

**Purpose:** Removes an empty directory.

**Usage:**
```bash
$ rmdir dir
```

**If directory isn't empty:**
- `rmdir` fails
- Use `rm -r dir` to delete directory and contents recursively

> **Warning**
>
> The `rm -r` command is one of the few that can do serious damage, especially if you run it as superuser. Don't use the `-r` flag with globs like `*`. Always double-check your command before running it.

### 2.5.6. Shell Globbing ("Wildcards")

**In plain English:** Globbing is like using a wildcard in a card game - the `*` symbol matches any cards (files), making it easy to work with multiple files at once.

**In technical terms:** The shell can match simple patterns to file and directory names, a process known as globbing. The shell expands glob patterns to matching filenames before running commands.

**Why it matters:** Globbing lets you operate on multiple files with one command. Understanding expansion prevents surprises when commands don't work as expected.

**Common glob characters:**

**Asterisk (`*`)** - Matches any number of arbitrary characters:

```bash
$ echo *              # Lists all files in current directory
$ echo at*            # Files starting with "at"
$ echo *at            # Files ending with "at"
$ echo *at*           # Files containing "at"
```

**Question mark (`?`)** - Matches exactly one arbitrary character:

```bash
$ echo b?at           # Matches "boat", "brat", etc.
```

**How expansion works:**

1. Shell matches glob to filenames
2. Shell substitutes matching filenames
3. Shell runs the revised command

**If no files match:**
- Bash performs no expansion
- Command runs with literal glob characters
- Example: `echo *dfkdsafh` prints `*dfkdsafh` if no files match

> **Warning**
>
> If you're used to Windows command prompt, break the habit of typing `*.*` to match all files. In Unix, use `*` to match all files. The pattern `*.*` matches only files containing a dot (`.`) in their names. Unix filenames don't need extensions.

**Preventing expansion:**

Enclose glob in single quotes to prevent expansion:

```bash
$ echo '*'            # Prints a star, doesn't expand
```

This is handy for commands like `grep` and `find`.

> **Insight**
>
> The shell performs expansions before running commands. If a `*` reaches a command without expanding, the shell won't do anything more with it - it's up to the command to decide what to do.

## 2.6. Intermediate Commands

This section describes essential intermediate Unix commands.

<CardGrid
  cards={[
    {
      title: 'grep',
      description: 'Search for patterns in files using regular expressions',
      color: colors.blue
    },
    {
      title: 'less',
      description: 'Page through large files one screen at a time',
      color: colors.green
    },
    {
      title: 'pwd',
      description: 'Display current working directory path',
      color: colors.orange
    },
    {
      title: 'diff',
      description: 'Compare two files and show differences',
      color: colors.purple
    },
    {
      title: 'file',
      description: 'Identify file type and format',
      color: colors.blue
    },
    {
      title: 'find/locate',
      description: 'Search for files in directory trees',
      color: colors.green
    },
    {
      title: 'head/tail',
      description: 'View beginning or end of files',
      color: colors.orange
    },
    {
      title: 'sort',
      description: 'Sort lines of text files',
      color: colors.purple
    }
  ]}
/>

### 2.6.1. grep

**In plain English:** Grep is like using the "Find" function in a document - it searches through files and shows you lines that match what you're looking for.

**In technical terms:** The `grep` command prints lines from files or input streams that match a regular expression pattern.

**Why it matters:** Grep is extraordinarily handy for finding specific content in files, especially when searching multiple files. It's one of the most-used Unix commands.

**Basic usage:**

```bash
$ grep root /etc/passwd
```

Prints lines in `/etc/passwd` containing "root".

**Multiple files:**

```bash
$ grep root /etc/*
```

Checks every file in `/etc` for "root" and prints filename + matching line.

**Important options:**

- `-i` - Case-insensitive matching
- `-v` - Inverts search (prints lines that DON'T match)
- `-E` - Extended regular expressions (same as `egrep`)

### 2.6.2. Regular Expressions

**In plain English:** Regular expressions are like super-powered search patterns. While wildcards let you search for filenames, regular expressions let you search for complex patterns in text content.

**In technical terms:** Regular expressions are patterns grounded in computer science theory, more powerful than wildcard-style patterns, with different syntax. They're common in Unix utilities.

**Why it matters:** Regular expressions enable sophisticated text searching and manipulation. They're used in grep, text editors, programming languages, and many other tools.

**Three important patterns to remember:**

1. `.*` - Matches any number of characters, including none (like `*` in globs)
2. `.+` - Matches one or more characters
3. `.` - Matches exactly one arbitrary character

**Example:**

```bash
$ grep 'ro.*t' /etc/passwd     # Matches "root", "robot", etc.
```

> **Insight**
>
> The `grep(1)` manual page contains detailed regular expression descriptions, but it can be difficult to read. For comprehensive learning, see *Mastering Regular Expressions* by Jeffrey E. F. Friedl.

### 2.6.3. less

**In plain English:** Less is like a book reader for files - it shows you one page at a time, letting you scroll forward and backward comfortably.

**Purpose:** Pages through files that are too large to fit on one screen.

**Basic usage:**

```bash
$ less /usr/share/dict/words
```

**Navigation:**

- **Spacebar** - Forward one screen
- **b** - Backward one screen
- **q** - Quit

**Searching:**

- **/word** - Search forward for "word"
- **?word** - Search backward for "word"
- **n** - Continue searching (next match)

**Using with pipes:**

```bash
$ grep ie /usr/share/dict/words | less
```

Sends `grep` output to `less` for easy viewing.

> **Insight**
>
> The `less` command is an enhanced version of an older program named `more`. Linux desktops and servers have `less`, but it's not standard on embedded systems and other Unix systems. If `less` isn't available, try `more`.

### 2.6.4. pwd

**Purpose:** Prints the current working directory.

**Basic usage:**

```bash
$ pwd
/home/username/documents
```

**Why use it when the prompt shows the path?**

1. Not all prompts include the current directory
2. Symbolic links can obscure the true path
   - Use `pwd -P` to show the physical path (resolves symlinks)

### 2.6.5. diff

**Purpose:** Shows differences between two text files.

**Basic usage:**

```bash
$ diff file1 file2
```

**Options:**

- Default format is often most comprehensible for humans
- `diff -u` preferred when sending output to others (unified format)
- Easier for automated tools to process

### 2.6.6. file

**In plain English:** The `file` command is like a detective that examines a file and tells you what type it is - text, image, program, etc.

**Purpose:** Identifies file format.

**Usage:**

```bash
$ file filename
```

**Example output:**

```bash
$ file image.jpg
image.jpg: JPEG image data, JFIF standard 1.01

$ file script.sh
script.sh: Bourne-Again shell script, ASCII text executable
```

> **Insight**
>
> You may be surprised by how much this innocent-looking command can do. It examines file contents and uses various tests to identify file types.

### 2.6.7. find and locate

**In plain English:** Find searches for files in real-time by walking through directories, while locate uses a pre-built index for faster (but possibly outdated) searches.

**Purpose:** Searches for files in directory trees.

**find basic usage:**

```bash
$ find dir -name file -print
```

Searches for `file` in `dir` and subdirectories.

**Pattern matching:**

```bash
$ find /home -name '*.txt' -print
```

Note: Enclose patterns in single quotes to protect from shell expansion.

> **Warning**
>
> Don't try advanced `find` options (like `-exec`) before mastering the basic form shown here. Understanding why you need `-name` and `-print` is essential.

**locate usage:**

```bash
$ locate filename
```

**find vs. locate:**

| Feature | find | locate |
|---------|------|--------|
| Speed | Slower (real-time search) | Faster (uses index) |
| Accuracy | Always current | May miss recent files |
| Index | Not needed | Requires periodic updates |

### 2.6.8. head and tail

**Purpose:** Quickly view portions of files or data streams.

**head - View beginning:**

```bash
$ head /etc/passwd          # First 10 lines
$ head -5 /etc/passwd       # First 5 lines
```

**tail - View end:**

```bash
$ tail /etc/passwd          # Last 10 lines
$ tail -5 /etc/passwd       # Last 5 lines
$ tail +5 /etc/passwd       # From line 5 to end
```

### 2.6.9. sort

**Purpose:** Sorts lines of text files in alphanumeric order.

**Basic usage:**

```bash
$ sort filename
```

**Options:**

- `-n` - Numerical sort (for lines starting with numbers)
- `-r` - Reverse order

## 2.7. Dot Files

**In plain English:** Dot files are like hidden files in Windows - they're there, but not normally visible to keep your directory listings clean. They usually contain configuration settings.

**In technical terms:** Dot files are files and directories whose names begin with a dot (`.`). Programs don't show them by default to avoid cluttering directory listings.

**Why it matters:** Dot files contain important configuration for programs and your shell. Understanding them helps you customize your environment and troubleshoot issues.

**Viewing dot files:**

```bash
$ ls           # Doesn't show dot files
$ ls -a        # Shows all files, including dot files
```

**Common dot files:**

- `.bashrc` - Bash configuration
- `.login` - Login configuration
- `.ssh/` - SSH configuration directory
- `.gitconfig` - Git configuration

**Important characteristics:**

- Nothing special about dot files except the naming convention
- `ls` doesn't list them without `-a`
- Shell globs don't match them unless explicitly patterned

**Glob patterns for dot files:**

```bash
$ echo .*              # Includes . and .. (current/parent directories)
$ echo .[^.]*          # Excludes . and ..
$ echo .??*            # Alternative to exclude . and ..
```

> **Warning**
>
> The pattern `.*` matches `.` (current directory) and `..` (parent directory), which can cause problems in commands like `rm -r .*`. Use more specific patterns like `.[^.]*` or `.??*`.

## 2.8. Environment and Shell Variables

**In plain English:** Variables are like labeled containers that store text. Shell variables are private to your shell, while environment variables are shared with programs you run.

**In technical terms:** Shell variables are temporary storage for text strings. Environment variables are similar but are passed to all programs the shell runs. Variables control shell behavior and program configuration.

**Why it matters:** Variables let you customize your environment, control program behavior, and write flexible shell scripts.

### 2.8.1. Shell Variables

**Assigning a shell variable:**

```bash
$ STUFF=blah
```

> **Warning**
>
> Don't put spaces around the `=` when assigning a variable.

**Accessing a variable:**

```bash
$ echo $STUFF
blah
```

Use `$` prefix to access the variable value.

### 2.8.2. Environment Variables

**In plain English:** Environment variables are like family heirlooms - they get passed down from parent processes to child processes, so programs you run inherit your environment settings.

**In technical terms:** Environment variables are like shell variables but not shell-specific. All Unix processes have environment variable storage. The OS passes all environment variables from the shell to programs it runs.

**Why it matters:** Environment variables configure programs without command-line options. Many programs read environment variables for settings, making your environment consistent across tools.

**Creating an environment variable:**

```bash
$ STUFF=blah
$ export STUFF
```

Or in one line:

```bash
$ export STUFF=blah
```

**Why use environment variables:**

- Child processes inherit them from parent
- Programs read them for configuration
- Example: `LESS` variable contains default options for `less`

**Finding variable documentation:**

Many manual pages have an "ENVIRONMENT" section describing variables the program uses.

## 2.9. The Command Path

**In plain English:** The PATH is like a list of places to look for commands. When you type a command, the shell searches these places in order until it finds the program.

**In technical terms:** PATH is a special environment variable containing the command path - a list of system directories the shell searches when locating commands. Directories are searched in order.

**Why it matters:** Understanding PATH helps you troubleshoot "command not found" errors and customize which programs run when you type a command.

**Viewing your PATH:**

```bash
$ echo $PATH
/usr/local/bin:/usr/bin:/bin
```

Path components are separated by colons (`:`).

**How the shell uses PATH:**

1. You run a command (e.g., `ls`)
2. Shell searches directories in PATH order
3. First matching program is executed
4. If no match is found, shell reports "command not found"

**Modifying PATH:**

**Prepend directory (search first):**

```bash
$ PATH=/my/dir:$PATH
```

**Append directory (search last):**

```bash
$ PATH=$PATH:/my/dir
```

> **Warning**
>
> If you mistype `$PATH` when modifying it, you can wipe out your entire path. Don't panic - the damage isn't permanent. Just start a new shell or close and reopen your terminal window.

## 2.10. Special Characters

**In plain English:** Special characters are symbols with special meanings in the shell, like `*` for wildcards or `|` for pipes. Knowing their names helps you communicate clearly about Linux commands.

**Why it matters:** When discussing Linux with others, you should know the proper names for special characters. It's also useful for searching documentation and avoiding ambiguity.

**Common special characters:**

| Character | Name(s) | Common Uses |
|-----------|---------|-------------|
| `*` | star, asterisk | Regular expressions, glob character |
| `.` | dot | Current directory, file/hostname delimiter |
| `!` | bang | Negation, command history |
| `|` | pipe | Command pipes |
| `/` | (forward) slash | Directory delimiter, search command |
| `\` | backslash | Literals, macros (never directories) |
| `$` | dollar | Variables, end of line |
| `'` | tick, (single) quote | Literal strings |
| `` ` `` | backtick, backquote | Command substitution |
| `"` | double quote | Semi-literal strings |
| `^` | caret | Negation, beginning of line |
| `~` | tilde, squiggle | Negation, directory shortcut |
| `#` | hash, sharp, pound | Comments, preprocessor, substitutions |
| `[ ]` | (square) brackets | Ranges |
| `{ }` | braces, (curly) brackets | Statement blocks, ranges |
| `_` | underscore, under | Substitute for space |

> **Insight**
>
> Control characters are often marked with a caret, like `^C` for Ctrl-C.

## 2.11. Command-Line Editing

**In plain English:** Instead of using arrow keys, learn keyboard shortcuts that work across many Unix programs. They're faster and work even on systems where arrow keys don't.

**In technical terms:** Most Linux shells and many Unix programs support Emacs-style control key combinations for command-line editing. These are standard keystrokes that work across different tools.

**Why it matters:** Learning these keystrokes makes you more efficient and ensures you can edit commands even on minimal systems or over slow connections.

**Essential command-line keystrokes:**

| Keystroke | Action |
|-----------|--------|
| `Ctrl-B` | Move cursor left |
| `Ctrl-F` | Move cursor right |
| `Ctrl-P` | Previous command (or move cursor up) |
| `Ctrl-N` | Next command (or move cursor down) |
| `Ctrl-A` | Move cursor to beginning of line |
| `Ctrl-E` | Move cursor to end of line |
| `Ctrl-W` | Erase preceding word |
| `Ctrl-U` | Erase from cursor to beginning of line |
| `Ctrl-K` | Erase from cursor to end of line |
| `Ctrl-Y` | Paste erased text (yank) |

> **Insight**
>
> Arrow keys work on most Linux systems, but learning these control key combinations makes you more versatile. Many Unix programs that use standard terminal I/O support these keystrokes.

## 2.12. Text Editors

**In plain English:** You need a powerful text editor because Linux configuration is mostly done through text files. Learning a real editor (vi or Emacs) is essential for serious Unix work.

**In technical terms:** Most Linux system components use plaintext configuration files. To maintain and configure the system, you need an editor capable of handling these files without corruption. The two standard Unix editors are vi and Emacs.

**Why it matters:** You'll edit files constantly on Linux. A powerful editor makes this efficient and prevents mistakes that could break your system.

### 2.12.1. Choosing an Editor

**vi (or vim):**
- Fast and efficient
- Modal editing (different modes for inserting text vs. commands)
- Plays like a video game
- Minimal keystrokes for common operations
- Steeper learning curve

**Emacs:**
- Comprehensive features
- Extensive online help
- More typing for operations
- Easier for beginners
- Highly extensible

> **Warning**
>
> You might be tempted to use friendlier editors like nano or Pico when starting out. However, if you tend to make a habit of the first thing you use, avoid this temptation. Learn vi or Emacs instead.

**Learning resources:**

- **vi/vim:** *Learning the vi and Vim Editors*, 7th edition, by Arnold Robbins, Elbert Hannah, and Linda Lamb
- **Emacs:** Built-in tutorial (press `Ctrl-H`, then type `T`), or *GNU Emacs Manual*, 18th edition, by Richard M. Stallman

### 2.12.2. Terminal vs. GUI Editors

**Terminal editors (like vi):**
- Run inside terminal window
- Use standard terminal I/O
- Work over SSH connections
- No graphical requirements

**GUI editors:**
- Start their own window
- Present graphical interface
- Independent of terminals
- Emacs runs in GUI by default but can run in terminal

## 2.13. Getting Online Help

**In plain English:** Linux comes with built-in documentation. Manual pages (man pages) are reference guides for commands. They're not tutorials, but they contain everything you need to know about using a command.

**In technical terms:** The manual page system provides comprehensive reference documentation for commands, system calls, library functions, file formats, and system administration. Manual pages are organized into numbered sections.

**Why it matters:** Learning to use manual pages makes you self-sufficient. Instead of searching online or asking for help, you can find answers immediately on your system.

### 2.13.1. Using man

**Basic usage:**

```bash
$ man ls
```

Shows the manual page for the `ls` command.

**Searching by keyword:**

```bash
$ man -k sort
```

Searches for manual pages containing "sort" in their descriptions.

**Example output:**

```
comm (1)    - compare two sorted files line by line
qsort (3)   - sorts an array
sort (1)    - sort lines of text files
sortm (1)   - sort messages
tsort (1)   - perform topological sort
```

### 2.13.2. Manual Sections

Manual pages are organized into numbered sections:

| Section | Description |
|---------|-------------|
| 1 | User commands |
| 2 | Kernel system calls |
| 3 | Higher-level Unix programming library documentation |
| 4 | Device interface and driver information |
| 5 | File descriptions (system configuration files) |
| 6 | Games |
| 7 | File formats, conventions, and encodings |
| 8 | System commands and servers |

**Specifying a section:**

Some terms have manual pages in multiple sections. Use the section number to specify:

```bash
$ man 5 passwd        # File format (/etc/passwd)
$ man 1 passwd        # Command (passwd command)
```

**Useful sections:**

- Sections 1, 5, 7, 8 are good supplements to this book
- Section 2 becomes useful after learning about system calls
- Section 3 is for programmers

### 2.13.3. Other Help Options

**Command help options:**

```bash
$ ls --help           # Some commands
$ ls -h               # Others
```

**GNU info system:**

```bash
$ info command
```

GNU Project switched to info format (texinfo). Often more detailed than man pages but more complex.

**Documentation directory:**

Some packages dump documentation in `/usr/share/doc`. Check this directory when searching for documentation.

## 2.14. Shell Input and Output Redirection

**In plain English:** Redirection is like plumbing for data - you can send command output to files instead of the screen, or chain commands together so one's output becomes another's input.

**In technical terms:** The shell allows you to redirect standard input, standard output, and standard error to and from files and other processes using special operators. This enables powerful command composition.

**Why it matters:** Redirection is one of Unix's most powerful features. It lets you save output, combine commands, and process data in sophisticated ways.

### 2.14.1. Output Redirection

**Redirect to file (overwrite):**

```bash
$ command > file
```

- Creates `file` if it doesn't exist
- Overwrites `file` if it exists (clobbers)

**Redirect to file (append):**

```bash
$ command >> file
```

Appends output to end of `file`.

> **Warning**
>
> Some shells have parameters to prevent clobbering. In bash, use `set -C` to avoid overwriting existing files with `>`.

### 2.14.2. Pipes

**In plain English:** A pipe is like a conveyor belt between commands - the output of one command flows directly into the input of the next.

**Syntax:**

```bash
$ command1 | command2
```

**Example:**

```bash
$ head /proc/cpuinfo | tr a-z A-Z
```

Converts `head` output to uppercase.

**Multiple pipes:**

```bash
$ command1 | command2 | command3
```

You can chain as many commands as needed.

### 2.14.3. Standard Error

**In plain English:** Standard error is a separate channel for error messages, so they don't get mixed up with normal output when you redirect to a file.

**Example showing stderr:**

```bash
$ ls /fffffffff > f
ls: cannot access /fffffffff: No such file or directory
```

- Output goes to file `f` (empty because no files found)
- Error message appears on screen (stderr)

**Redirect stderr to file:**

```bash
$ ls /fffffffff > f 2> e
```

- Standard output → file `f`
- Standard error → file `e`
- `2>` specifies stream ID 2 (stderr)

**Redirect both stdout and stderr to same file:**

```bash
$ ls /fffffffff > f 2>&1
```

The `2>&1` notation sends stderr to the same place as stdout.

### 2.14.4. Standard Input Redirection

**Syntax:**

```bash
$ head < /proc/cpuinfo
```

**When it's needed:**

This is less common because most Unix commands accept filenames as arguments:

```bash
$ head /proc/cpuinfo      # Preferred (same result)
```

You'll occasionally encounter programs that require input redirection.

## 2.15. Understanding Error Messages

**In plain English:** Unix error messages actually tell you what went wrong, unlike some other operating systems. Reading them carefully saves time and frustration.

**Why it matters:** Error messages are your friends. They provide exact information about problems. Learning to read them helps you troubleshoot efficiently.

### 2.15.1. Anatomy of an Error Message

**Example:**

```bash
$ ls /dsafsda
ls: cannot access /dsafsda: No such file or directory
```

**Three components:**

1. **Program name:** `ls` (identifies what generated the error)
2. **Specific information:** `/dsafsda` (the problematic path)
3. **Error description:** "No such file or directory" (what's wrong)

**Translation:** "ls tried to open /dsafsda but couldn't because it doesn't exist."

> **Insight**
>
> Always address the first error first. Some programs report they can't do anything before reporting other problems. Fixing the first error often resolves subsequent ones.

**Example of cascading errors:**

```
scumd: cannot access /etc/scumd/config: No such file or directory
[huge list of other errors follows]
```

Don't be distracted by the flood of errors. Just create `/etc/scumd/config`.

> **Warning**
>
> Don't confuse error messages with warning messages. Warnings contain the word "warning" and indicate potential problems, but the program continues running. Errors usually stop execution.

### 2.15.2. Common Errors

**No such file or directory (ENOENT):**

- Most common error
- File or directory doesn't exist
- Applies to both files and directories
- Occurs when reading, writing, or changing directories

**File exists:**

- Tried to create something that already exists
- Common when creating a directory with the same name as a file

**Not a directory / Is a directory:**

- Tried to use a file as a directory, or vice versa
- Example:
  ```bash
  $ touch a
  $ touch a/b
  touch: a/b: Not a directory
  ```

**No space left on device:**

- Disk is full
- Cannot write more data

**Permission denied:**

- Insufficient privileges to access file or directory
- Also occurs when execute bit isn't set on a file you're trying to run

**Operation not permitted:**

- Usually when trying to kill a process you don't own
- May occur with other privileged operations

**Segmentation fault / Bus error:**

- Program bug (tried to access memory incorrectly)
- Operating system killed the program
- May result from unexpected input
- Rarely indicates faulty hardware

## 2.16. Listing and Manipulating Processes

**In plain English:** A process is a running program. The `ps` command shows you what's running, and `kill` lets you stop processes. Understanding processes helps you troubleshoot and manage your system.

**In technical terms:** Each process has a numeric process ID (PID). The `ps` command lists running processes with their states, resource usage, and other attributes. The `kill` command sends signals to processes.

**Why it matters:** Process management is fundamental to system administration and troubleshooting. You'll use these commands constantly to understand what's running and control programs.

### 2.16.1. Using ps

**Basic usage:**

```bash
$ ps
  PID TTY      STAT   TIME COMMAND
  520 p0       S      0:00 -bash
  545 ?        S      3:59 /usr/X11R6/bin/ctwm -W
  548 ?        S      0:10 xclock -geometry -0-0
 2159 pd       SW     0:00 /usr/bin/vi lib/addresses
31956 p3       R      0:00 ps
```

**Column meanings:**

- **PID:** Process ID (unique identifier)
- **TTY:** Terminal device where process is running
- **STAT:** Process status (S=sleeping, R=running, etc.)
- **TIME:** CPU time used (minutes:seconds)
- **COMMAND:** Command used to run the program

### 2.16.2. ps Options

<CardGrid
  cards={[
    {
      title: 'ps x',
      description: 'Show all your running processes',
      color: colors.blue
    },
    {
      title: 'ps ax',
      description: 'Show all processes on the system',
      color: colors.green
    },
    {
      title: 'ps u',
      description: 'Include detailed information',
      color: colors.orange
    },
    {
      title: 'ps w',
      description: 'Show full command names',
      color: colors.purple
    }
  ]}
/>

**Combine options:**

```bash
$ ps aux          # All processes, detailed
$ ps auxw         # All processes, detailed, full commands
```

**Check specific process:**

```bash
$ ps u $$         # Current shell ($$  = shell's PID)
```

### 2.16.3. Process Termination

**In plain English:** Killing a process is like asking a program to stop. You can ask nicely (TERM), pause it temporarily (STOP), or force it to stop immediately (KILL).

**Basic kill:**

```bash
$ kill pid
```

Sends TERM (terminate) signal - the default.

**Common signals:**

**STOP - Pause process:**

```bash
$ kill -STOP pid
```

Process freezes but stays in memory.

**CONT - Resume process:**

```bash
$ kill -CONT pid
```

Process continues from where it stopped.

**KILL - Force termination:**

```bash
$ kill -KILL pid
```

- Most brutal termination
- Kernel forcibly removes process from memory
- Process can't clean up or ignore this signal
- Use as last resort

> **Warning**
>
> Don't kill processes indiscriminately. You may break important system functions. Only kill processes you understand and own.

**Using signal numbers:**

```bash
$ kill -9 pid     # Same as kill -KILL pid
```

Run `kill -l` to see signal number-to-name mappings.

> **Insight**
>
> Using `Ctrl-C` to terminate a process in the current terminal is the same as using `kill` with the INT (interrupt) signal.

### 2.16.4. Job Control

**In plain English:** Job control lets you pause and resume programs, but it's often unnecessary and can be confusing. Better to run programs in separate terminal windows.

**Basic job control:**

- `Ctrl-Z` - Suspend current process (sends TSTP signal)
- `fg` - Bring suspended process to foreground
- `bg` - Move suspended process to background
- `jobs` - List suspended processes

> **Warning**
>
> Beginners often accidentally press `Ctrl-Z` instead of `Ctrl-C`, forget about suspended processes, and eventually have numerous suspended processes. If you accidentally suspend, use `fg` to resume or `kill` to terminate.

**Better alternatives:**

- Run programs in separate terminal windows
- Use `screen` or `tmux` utilities
- Put non-interactive processes in background (next section)

### 2.16.5. Background Processes

**In plain English:** Running a process in the background is like starting a task and immediately getting back to work - you don't have to wait for it to finish.

**Syntax:**

```bash
$ gunzip file.gz &
```

The `&` detaches the process from the shell.

**What happens:**

1. Shell prints the background process's PID
2. Shell prompt returns immediately
3. You can continue working
4. Process continues running even after logout (usually)

**Example:**

```bash
$ gunzip largefile.gz &
[1] 12345
$                      # Prompt returns immediately
```

**Potential issues:**

**1. Input expectations:**

If a background process tries to read from stdin:
- Process may freeze (use `fg` to bring it back)
- Process may terminate

**2. Unexpected output:**

Background processes may write to stdout/stderr:
- Output appears in your terminal randomly
- Can interrupt your current work

**Solution:**

Redirect output and input:

```bash
$ gunzip file.gz > output.txt 2> errors.txt &
```

**Keeping processes running after logout:**

Use `nohup` for remote sessions:

```bash
$ nohup long-running-command &
```

**Dealing with spurious output:**

- `Ctrl-L` - Redraws screen (works in bash and most programs)
- `Ctrl-R` - Redraws current line (in programs reading stdin)

> **Warning**
>
> Pressing `Ctrl-R` at the bash prompt enters reverse isearch mode (press `Esc` to exit). Be careful with key combinations.

## 2.17. File Modes and Permissions

**In plain English:** File permissions are like locks on doors - they control who can read, write, or execute files. Understanding permissions prevents security problems and access issues.

**In technical terms:** Every Unix file has a set of permissions that determine read, write, and execute access for the owner, group, and others. The file mode encodes these permissions along with file type information.

**Why it matters:** Permissions protect your files, control access to system resources, and enable secure multi-user systems. Misconfigured permissions cause security vulnerabilities or access problems.

### 2.17.1. Understanding File Modes

**Example from ls -l:**

```
-rw-r--r-- 1 juser somegroup 7041 Mar 26 19:34 endnotes.html
```

**File mode breakdown:** `-rw-r--r--`

```
- rw- r-- r--
│ │   │   └─ Other permissions
│ │   └───── Group permissions
│ └───────── User (owner) permissions
└─────────── File type
```

**File type indicators:**

- `-` Regular file
- `d` Directory
- `l` Symbolic link
- `b` Block device
- `c` Character device
- `p` Named pipe
- `s` Socket

**Permission characters:**

- `r` Readable
- `w` Writable
- `x` Executable
- `-` Permission not granted

### 2.17.2. Permission Sets

**Three permission sets:**

1. **User (owner):** Applies to file owner
2. **Group:** Applies to users in the file's group
3. **Other (world):** Applies to everyone else

**Example permissions:**

```
-rw-r--r--
```

- User: `rw-` (read and write)
- Group: `r--` (read only)
- Other: `r--` (read only)

**Using groups:**

```bash
$ groups          # See your groups
```

> **Insight**
>
> Permission slots are sometimes called "permission bits" because they're represented as bits in the operating system. You may hear people refer to "the read bits."

### 2.17.3. Special Permissions: setuid

**In plain English:** Setuid is like borrowing someone's identity. When you run a setuid program, it runs as if the file owner executed it, not you. This lets regular users run programs that need special privileges.

**Example:**

```
-rwsr-xr-x 1 root root 54256 Mar 29 passwd
```

Notice the `s` in the user permissions instead of `x`.

**The passwd program:**

- Owned by root
- Has setuid bit set
- When you run it, it runs as root
- Needs root privileges to modify `/etc/passwd`
- You can change your password without being root

> **Warning**
>
> Setuid programs are powerful but dangerous. They're common attack vectors. Only system programs should use setuid, and only when absolutely necessary.

### 2.17.4. Modifying Permissions with chmod

**In plain English:** The `chmod` command changes permissions. You can add or remove permissions for user, group, and others using simple notation.

**Symbolic notation:**

**Add permissions:**

```bash
$ chmod g+r file          # Add group read
$ chmod o+r file          # Add other read
$ chmod go+r file         # Add group and other read
```

**Remove permissions:**

```bash
$ chmod go-r file         # Remove group and other read
```

**Permission targets:**

- `u` User (owner)
- `g` Group
- `o` Other
- `a` All (user, group, and other)

**Permission types:**

- `r` Read
- `w` Write
- `x` Execute

> **Warning**
>
> Don't make files world-writable (`chmod o+w file`) unless absolutely necessary. This allows anyone on your system to modify them.

### 2.17.5. Absolute Permission Modes

**Numeric notation:**

```bash
$ chmod 644 file
```

This is called an absolute change because it sets all permission bits at once.

**Common absolute modes:**

| Mode | Meaning | Used For |
|------|---------|----------|
| 644 | `rw-r--r--` (user: rw, group/other: r) | Files |
| 600 | `rw-------` (user: rw, group/other: none) | Private files |
| 755 | `rwxr-xr-x` (user: rwx, group/other: rx) | Directories, programs |
| 700 | `rwx------` (user: rwx, group/other: none) | Private directories |
| 711 | `rwx--x--x` (user: rwx, group/other: x) | Directories (execute only) |

> **Insight**
>
> You don't need to know how to construct absolute modes. Just memorize the common ones you use most often. See the `chmod(1)` manual page for details on octal notation.

### 2.17.6. Directory Permissions

**In plain English:** Directory permissions work differently than file permissions. To list a directory's contents, it needs to be readable. To access files inside, it needs to be executable. You usually need both.

**Directory permission meanings:**

- **r (readable):** Can list directory contents (`ls`)
- **x (executable):** Can access files in the directory (`cd`, file operations)
- **w (writable):** Can create/delete files in directory

**Common mistake:**

Accidentally removing execute permission when setting absolute modes:

```bash
$ chmod 644 mydir         # Wrong! Directory needs execute
$ chmod 755 mydir         # Correct for directories
```

### 2.17.7. umask

**In plain English:** The umask is like a default security setting for new files - it automatically sets permissions on anything you create.

**Purpose:** Sets default permissions for newly created files.

**Common umask values:**

```bash
$ umask 022          # Everyone can read your files
$ umask 077          # Only you can read your files
```

**Making it permanent:**

Add `umask` command to your startup files (Chapter 13) to apply to all new sessions.

## 2.18. Symbolic Links

**In plain English:** A symbolic link is like a shortcut in Windows - it's a file that points to another file or directory, creating an alias for easy access.

**In technical terms:** A symbolic link is a file containing a pathname that the system follows when you access the link. The link itself is just a pointer; it doesn't contain the actual data.

**Why it matters:** Symbolic links organize files, provide convenient access to deeply nested directories, and enable multiple names for the same resource.

### 2.18.1. Identifying Symbolic Links

**In ls -l output:**

```bash
lrwxrwxrwx 1 ruser users 11 Feb 27 13:52 somedir -> /home/origdir
```

- First character is `l` (link)
- Shows target path after `->`
- Link name is `somedir`
- Target is `/home/origdir`

### 2.18.2. Creating Symbolic Links

**Syntax:**

```bash
$ ln -s target linkname
```

- `target` - File or directory the link points to
- `linkname` - Name of the symbolic link
- `-s` - Creates symbolic link (not hard link)

**Example:**

```bash
$ ln -s /usr/local/bin/program /home/user/myprogram
```

> **Warning**
>
> Check your command twice before running it. It's easy to reverse the arguments accidentally. If `target` is an existing directory and you reverse arguments, `ln` creates a link inside that directory pointing to itself!

### 2.18.3. Symbolic Link Issues

**Broken links:**

If target doesn't exist:
- Link still exists
- Programs accessing the link get errors
- `ls -l` shows the link but accessing it fails

**Chained links:**

Links can point to other links:
- Creates confusion when tracking down files
- Can be difficult to debug

**Editing through links:**

If you edit what looks like a file copy:
- Might actually be a symbolic link
- Edits affect the original file
- Can cause unexpected changes

> **Warning**
>
> Don't forget the `-s` option when creating symbolic links. Without it, `ln` creates a hard link, which is different and more confusing. Unless you understand hard links (Section 4.6), avoid them.

### 2.18.4. Why Use Symbolic Links

Despite potential pitfalls, symbolic links are extremely useful:

**Common use cases:**

1. **Program expects specific path:**
   - Program looks for `/usr/lib/oldfile`
   - Actual file is at `/opt/newlocation/oldfile`
   - Create symbolic link: `ln -s /opt/newlocation/oldfile /usr/lib/oldfile`

2. **Easy access to deep directories:**
   - Long path: `/var/www/sites/production/app/config`
   - Create shortcut: `ln -s /var/www/sites/production/app/config ~/myconfig`

3. **Version management:**
   - Current version: `/usr/lib/python3.12`
   - Generic link: `/usr/lib/python` -> `/usr/lib/python3.12`
   - Programs use generic link
   - Easy to update by changing link target

## 2.19. Archiving and Compressing Files

**In plain English:** Archiving bundles multiple files into one file (like putting papers in an envelope), while compression makes files smaller (like vacuum-sealing). Unix tools do these separately.

**In technical terms:** `tar` creates archives by combining multiple files and directories into a single file. `gzip` compresses files to reduce size. They're often used together to create compressed archives.

**Why it matters:** Compressed archives are the standard way to distribute software, backup files, and transfer data efficiently on Unix systems.

### 2.19.1. gzip

**Purpose:** Compression program that reduces file size.

**File extension:** `.gz`

**Uncompress:**

```bash
$ gunzip file.gz
```

- Uncompresses `file.gz`
- Removes `.gz` suffix
- Creates `file`

**Compress:**

```bash
$ gzip file
```

- Compresses `file`
- Adds `.gz` suffix
- Creates `file.gz`
- Removes original `file`

### 2.19.2. tar

**In plain English:** The `tar` program creates archives - single files containing multiple files and directories with their structure preserved.

**Purpose:** Creates and extracts archives (doesn't compress).

**File extension:** `.tar` (by convention)

**Creating archives:**

```bash
$ tar cvf archive.tar file1 file2 dir1
```

**Options explained:**

- `c` Create mode
- `v` Verbose (show files being archived)
- `f` File option (next argument is archive filename)

**The v flag:**

- One `v` - Prints filenames
- Two `v`'s (`-vv`) - Prints details (size, permissions)
- Omit for silent operation

**The f flag:**

- Must be followed by filename
- Required except with tape drives
- Use `-` for stdin/stdout

### 2.19.3. Extracting tar Archives

**Basic extraction:**

```bash
$ tar xvf archive.tar
```

- `x` Extract (unpack) mode
- Archive file remains after extraction

**Extract specific files:**

```bash
$ tar xvf archive.tar file1 dir/file2
```

Must specify exact names (check with table-of-contents mode first).

### 2.19.4. Table-of-Contents Mode

**In plain English:** Before unpacking an archive, peek inside to see what it contains and verify it won't make a mess in your current directory.

**Purpose:** Lists archive contents without extracting.

**Usage:**

```bash
$ tar tvf archive.tar
```

- `t` Table-of-contents mode
- Lists all files in archive
- Verifies archive isn't corrupt

**Before extracting, verify:**

1. Archive has rational directory structure
2. All paths start with same directory
3. Won't dump files directly into current directory

**If unsure:**

```bash
$ mkdir temp
$ cd temp
$ tar xvf ../archive.tar
$ ls                      # Check what was extracted
```

If it's clean, you can move contents: `mv * ..`

### 2.19.5. Preserving Permissions

**Use -p option:**

```bash
$ tar xvpf archive.tar
```

- Overrides your umask
- Extracts exact permissions from archive
- Default when running as superuser

> **Warning**
>
> When extracting as superuser, wait for command to complete before checking results. `tar` sets permissions only after processing the entire archive.

### 2.19.6. Compressed Archives (.tar.gz)

**In plain English:** Most archives you'll encounter are both tarred and gzipped. Work from right to left - decompress first, then extract.

**Common extension:** `.tar.gz` or `.tgz`

**Two-step extraction:**

```bash
$ gunzip file.tar.gz      # Creates file.tar
$ tar xvf file.tar        # Extracts files
```

**Creating compressed archive:**

```bash
$ tar cvf archive.tar files...    # Create archive
$ gzip archive.tar                # Compress it
```

### 2.19.7. Efficient Compressed Archive Handling

**Using zcat and pipes:**

```bash
$ zcat file.tar.gz | tar xvf -
```

- `zcat` decompresses to stdout
- Pipe to `tar` for extraction
- `-` tells tar to read from stdin
- No temporary files created
- Saves disk space and I/O

**Linux tar shortcut:**

```bash
$ tar zxvf file.tar.gz    # Extract
$ tar ztfv file.tar.gz    # Table of contents
$ tar zcvf archive.tar.gz files...  # Create
```

The `z` option automatically invokes gzip.

> **Insight**
>
> Remember you're performing two steps even when using the shortcut. Understanding the separate operations helps when troubleshooting.

**Note:** `.tgz` files are identical to `.tar.gz` (the suffix fits FAT/MS-DOS filesystems).

### 2.19.8. Other Compression Utilities

**xz and bzip2:**

- **Extensions:** `.xz` and `.bz2`
- **Decompression:** `unxz` and `bunzip2`
- **Characteristics:** Slower than gzip, better compression for text
- **Options:** Similar to gzip

**zip/unzip:**

- Compatible with Windows ZIP archives
- Works on `.zip` files
- Handles self-extracting `.exe` archives
- Available on most Linux distributions

**compress (.Z files):**

- Old Unix standard (rare now)
- `gunzip` can decompress `.Z` files
- `gzip` won't create them

## 2.20. Linux Directory Hierarchy Essentials

**In plain English:** The Linux directory structure is like a well-organized filing system, with specific places for programs, configuration files, user data, and temporary files. Understanding this structure helps you find what you need.

**In technical terms:** The Filesystem Hierarchy Standard (FHS) defines the Linux directory structure. The root directory (`/`) contains standard subdirectories with specific purposes. Similar patterns repeat under `/usr`.

**Why it matters:** Knowing where things are located helps you configure systems, troubleshoot problems, install software, and understand how Linux is organized.

<TreeDiagram
  title="Linux Directory Hierarchy"
  root={{
    label: '/',
    color: colors.blue,
    children: [
      { title: '/bin - Essential command binaries', color: colors.green },
      { title: '/boot - Kernel and boot loader files', color: colors.green },
      { title: '/dev - Device files', color: colors.purple },
      { title: '/etc - System configuration files', color: colors.orange },
      { title: '/home - User home directories', color: colors.cyan },
      { title: '/lib - Shared libraries', color: colors.green },
      { title: '/proc - Process and kernel information', color: colors.purple },
      { title: '/root - Root user home directory', color: colors.cyan },
      { title: '/run - Runtime variable data', color: colors.slate },
      { title: '/sbin - System binaries', color: colors.green },
      { title: '/sys - Device and system interface', color: colors.purple },
      { title: '/tmp - Temporary files', color: colors.slate },
      {
        label: '/usr',
        color: colors.blue,
        children: [
          { title: 'bin - User command binaries', color: colors.green },
          { title: 'lib - User libraries', color: colors.green },
          { title: 'local - Locally installed software', color: colors.orange },
          { title: 'sbin - Non-essential system binaries', color: colors.green },
          { title: 'share - Architecture-independent data', color: colors.slate }
        ]
      },
      {
        label: '/var',
        color: colors.blue,
        children: [
          { title: 'log - Log files', color: colors.orange },
          { title: 'tmp - Temporary files (persistent)', color: colors.slate },
          { title: 'run - Runtime data (older systems)', color: colors.slate }
        ]
      }
    ]
  }}
/>

### 2.20.1. Root Directory Structure

**Important subdirectories in `/`:**

**/bin**
- Ready-to-run programs (executables)
- Basic Unix commands: `ls`, `cp`, etc.
- Most are binary (compiled)
- Some are shell scripts

**/dev**
- Device files
- Covered in Chapter 3

**/etc** (pronounced "EHT-see")
- Core system configuration
- User passwords
- Boot configuration
- Device, networking, and other setup files

**/home**
- Home (personal) directories for regular users
- Standard across most Unix installations

**/lib**
- Library files (shared code for executables)
- Should contain only shared libraries
- Other `lib` directories may have static libraries too

**/proc**
- System statistics through browsable interface
- Currently running process information
- Some kernel parameters
- Unique to Linux but similar features exist in other Unix variants

**/run**
- Runtime data specific to the system
- Process IDs, socket files, status records
- Often contains system logging
- Recent addition to root directory
- On older systems, found at `/var/run` (often now a symlink to `/run`)

**/sys**
- Device and system interface (similar to `/proc`)
- Covered in Chapter 3

**/sbin**
- System executables
- System management programs
- Often require root privileges
- Not usually in regular users' command paths

**/tmp**
- Temporary files
- Any user can read and write
- Users can't access each other's files
- Don't store important data here
- Usually cleared on boot
- May have automatic cleanup
- Often shares space with critical partitions

**/usr**
- Large directory hierarchy
- Contains bulk of Linux system
- Similar directory names as root (`/usr/bin`, `/usr/lib`)
- Historically separate to save space on root partition

**/var**
- Variable subdirectory
- Data that changes over time
- System logging
- User tracking
- Caches
- Other dynamic files
- Contains `/var/tmp` (not wiped on boot)

### 2.20.2. Other Root Subdirectories

**/boot**
- Kernel boot loader files
- Only first stage of Linux startup
- Service startup info elsewhere
- Covered in Chapter 5

**/media**
- Base attachment point for removable media
- Flash drives, etc.
- Found in many distributions

**/opt**
- Optional third-party software
- Many systems don't use `/opt`

### 2.20.3. The /usr Directory

**In plain English:** The `/usr` directory looks clean but contains most user-space programs and data. It's like a miniature root directory with its own `bin`, `lib`, and other subdirectories.

**Key subdirectories:**

**/usr/bin, /usr/sbin, /usr/lib**
- Similar to `/bin`, `/sbin`, `/lib`
- Contains most user-space programs

**/usr/include**
- C compiler header files

**/usr/local**
- Administrator-installed software
- Structure mirrors `/` and `/usr`

**/usr/share**
- Files that work on other Unix machines
- Architecture-independent data
- Manual pages (`/usr/share/man`)
- Info pages (`/usr/share/info`)
- Other auxiliary data
- Historically shared from file servers
- Now used for organizational convention

### 2.20.4. Kernel Location

**Kernel file:**
- `/vmlinuz` or `/boot/vmlinuz`
- Binary file
- Loaded into memory by boot loader
- Not used after system boots

**Loadable kernel modules:**
- Located under `/lib/modules`
- Kernel loads/unloads on demand
- Enable dynamic hardware support

> **Insight**
>
> Once the boot loader starts the kernel, the main kernel file is no longer used by the running system. However, loadable kernel modules in `/lib/modules` are used during normal operation.

## 2.21. Running Commands as the Superuser

**In plain English:** Running commands as root is like having a master key - powerful but dangerous. Using `sudo` is safer than starting a root shell because it logs what you do and limits your time with dangerous privileges.

**In technical terms:** The `sudo` package allows administrators to run commands as root while logged in as themselves. It provides logging, accountability, environment preservation, and doesn't require sharing the root password.

**Why it matters:** Proper superuser access management prevents accidents, provides audit trails, and maintains security. Most modern distributions use `sudo` instead of direct root access.

### 2.21.1. Why Not Use a Root Shell?

**Disadvantages of starting a root shell:**

1. No record of system-altering commands
2. No record of which users performed actions
3. Don't have access to your normal shell environment
4. Must enter root password (if you have one)

### 2.21.2. Using sudo

**Basic usage:**

```bash
$ sudo vipw
```

**What happens:**

1. Prompts for your password (not root's)
2. Runs command as root
3. Logs action with syslog service
4. Returns to normal user privileges

**Example:**

```bash
$ sudo apt update
[sudo] password for username:
# Command runs as root
$ # Back to normal user
```

### 2.21.3. Configuring /etc/sudoers

**In plain English:** The `/etc/sudoers` file controls who can run commands as root and what commands they can run. Always edit it with `visudo` to prevent syntax errors.

**Example configuration:**

```
User_Alias ADMINS = user1, user2

ADMINS ALL = NOPASSWD: ALL

root ALL=(ALL) ALL
```

**Line-by-line explanation:**

**Line 1:** Defines `ADMINS` user alias with two users

**Line 2:** Grants privileges to `ADMINS`
- `ALL =` Any host
- `NOPASSWD:` Don't require password
- `ALL` Any command

**Line 3:** Root can use sudo
- `ALL=` Any host
- `(ALL)` Can run commands as any user
- `ALL` Any command

**Allowing user switching:**

```
ADMINS ALL = (ALL) NOPASSWD: ALL
```

The `(ALL)` allows running commands as any user, not just root.

> **Warning**
>
> Always use the `visudo` command to edit `/etc/sudoers`. This command checks for syntax errors after you save, preventing lockouts from misconfiguration.

### 2.21.4. Viewing sudo Logs

**Modern systems (systemd):**

```bash
$ journalctl SYSLOG_IDENTIFIER=sudo
```

**Older systems:**

Check logfiles in `/var/log`, such as:
- `/var/log/auth.log`
- `/var/log/secure`

**Log entries show:**

- Who ran the command
- When it was run
- What command was executed
- Whether it succeeded or failed

## 2.22. Looking Forward

You should now know how to:

- Run programs and redirect output
- Interact with files and directories
- View process listings
- View manual pages
- Navigate the user space of a Linux system
- Run commands as the superuser

You may not yet know much about internal details of user-space components or kernel operations, but with the basics of files and processes under your belt, you're on your way.

**What's next:**

In the next few chapters, you'll work with both kernel and user-space system components using the command-line tools you just learned.

The journey continues with devices and how the kernel manages hardware.

---

**Previous:** [Chapter 1: The Big Picture](ch01-big-picture.md) | **Next:** [Chapter 3: Devices](ch03-devices.md)
