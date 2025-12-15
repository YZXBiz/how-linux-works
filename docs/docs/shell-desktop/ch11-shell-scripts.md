---
sidebar_position: 1
title: "Introduction to Shell Scripts"
description: "Learn shell scripting fundamentals including syntax, variables, conditionals, loops, and best practices for automating Linux tasks"
---

import { ProcessFlow, StackDiagram, CardGrid, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# Introduction to Shell Scripts

If you can enter commands into the shell, you can write shell scripts. A shell script is a series of commands written in a file. The shell reads these commands just as it would if you typed them into a terminal.

**What it is**: Shell scripts are text files containing sequences of shell commands that execute automatically.

**Why it matters**: Scripts automate repetitive tasks, simplify complex operations, and make your work reproducible and shareable.

**How it works**: The shell interpreter reads your script line by line, executing each command in sequence, with full access to variables, conditionals, and loops.

## 1. Shell Script Basics

### 1.1. The Shebang

Bourne shell scripts start with a special line indicating which program should execute the commands.

```bash
#!/bin/sh
```

The `#!` part is called a **shebang**. Make sure there's no whitespace at the beginning of the script file.

<ProcessFlow
  title="Shell Script Execution Flow"
  steps={[
    { title: 'User runs script', description: './myscript' },
    { title: 'Kernel reads shebang', description: '#!/bin/sh' },
    { title: 'Kernel starts /bin/sh', description: 'Launches shell interpreter' },
    { title: 'Shell reads script', description: 'Executes commands sequentially' },
    { title: 'Script completes', description: 'Returns exit code' }
  ]}
/>

**What it is**: The shebang is a two-character sequence (`#!`) followed by the path to an interpreter.

**Why it matters**: It tells the kernel which program should execute your script, making scripts portable and self-documenting.

**How it works**: When the kernel encounters a file starting with `#!`, it extracts the interpreter path and runs that program with your script as an argument.

### 1.2. Comments

A `#` character at the beginning of a line (except the shebang) indicates a comment. The shell ignores anything after the `#` on that line.

```bash
#!/bin/sh

# Print something, then run ls
echo About to run the ls command.
ls
```

Use comments to explain parts of your scripts that could be difficult to understand. They help others reading your code and remind you what you were thinking when you return later.

:::tip[Best Practice]
Write comments that explain **why** you're doing something, not just **what** the code does. The code itself shows what happens.
:::

### 1.3. Making Scripts Executable

Shell scripts need both read and execute permissions to run properly.

```bash
$ chmod +rx script
```

This allows all users to read and execute the script. For private scripts, use mode `700` instead:

```bash
$ chmod 700 script
```

**Running your script**:
- Place it in a directory in your `$PATH` and run by name: `myscript`
- Run from current directory: `./myscript`
- Run with full path: `/home/user/bin/myscript`

:::info[Alternative Shebangs]
The shebang doesn't have to be `#!/bin/sh`. You can use any interpreter:
- `#!/usr/bin/python` for Python scripts
- `#!/usr/bin/env python` to find Python in the current `$PATH` (portable but less predictable)
:::

### 1.4. Limitations of Shell Scripts

Shell scripts excel at certain tasks but have clear limitations.

<CardGrid
  title="Shell Scripts: When to Use"
  cards={[
    {
      title: 'Best For',
      items: [
        'File manipulation and batch operations',
        'Automating command sequences',
        'Simple text processing',
        'System administration tasks',
        'Quick prototypes and glue code'
      ],
      color: colors.green
    },
    {
      title: 'Not Ideal For',
      items: [
        'Complex string manipulation',
        'Heavy arithmetic computations',
        'Database operations',
        'Large-scale applications',
        'Performance-critical tasks'
      ],
      color: colors.orange
    },
    {
      title: 'Better Alternatives',
      items: [
        'Python for complex logic',
        'Perl for text processing',
        'awk for data extraction',
        'C for performance',
        'Go for concurrent systems'
      ],
      color: colors.blue
    }
  ]}
/>

:::warning[Keep Scripts Short]
Shell scripts aren't meant to be big. If your script becomes convoluted or exceeds a few hundred lines, consider using a more appropriate language.
:::

## 2. Quoting and Literals

### 2.1. The Problem with Special Characters

Consider this example:

```bash
$ echo $100
00
```

Why does this print `00`? Because `$1` is interpreted as a shell variable. The shell sees `$1` (which is empty) followed by `00`.

**What it is**: A literal is a string that the shell should not analyze or modify before passing to a command.

**Why it matters**: Special characters like `$`, `*`, `;`, and `>` have meaning to the shell. Without proper quoting, they'll be interpreted instead of passed literally.

**How it works**: Quotes tell the shell to treat characters as ordinary text rather than special syntax.

### 2.2. Single Quotes

Single quotes create the strongest form of literal. The shell leaves **everything** between single quotes alone.

```bash
$ echo '$100'
$100

$ grep 'r.*t' /etc/passwd
```

All characters between single quotes, including spaces, make up a **single parameter**.

```bash
$ grep 'r.*t /etc/passwd'  # Wrong! Searches stdin for the string "r.*t /etc/passwd"
$ grep 'r.*t' /etc/passwd  # Correct! Searches /etc/passwd for pattern "r.*t"
```

**Best practice**: Use single quotes first when you need literals. They're guaranteed to prevent all substitutions.

### 2.3. Double Quotes

Double quotes work like single quotes, except the shell **expands variables** inside them.

```bash
$ echo "There is no _ in my path: $PATH"
There is no _ in my path: /usr/local/bin:/usr/bin:/bin
```

Notice that `$PATH` is expanded, but `_` is not (it's not a valid variable name).

<CardGrid
  title="Quote Type Comparison"
  cards={[
    {
      title: 'Single Quotes',
      items: [
        'Blocks all substitutions',
        'Treats everything literally',
        'Cannot contain single quote',
        'Use for complete literals',
        'Example: \'$HOME/*.txt\''
      ],
      color: colors.blue
    },
    {
      title: 'Double Quotes',
      items: [
        'Allows variable expansion',
        'Blocks glob expansion',
        'Can contain escaped quotes',
        'Use when variables needed',
        'Example: "$HOME/*.txt"'
      ],
      color: colors.green
    },
    {
      title: 'No Quotes',
      items: [
        'All expansions occur',
        'Word splitting happens',
        'Glob patterns expand',
        'Generally avoid',
        'Example: $HOME/*.txt'
      ],
      color: colors.orange
    }
  ]}
/>

### 2.4. Literal Single Quotes

To include a literal single quote in output, use a backslash:

```bash
$ echo I don\'t like contractions inside shell scripts.
I don't like contractions inside shell scripts.
```

Or enclose it in double quotes:

```bash
$ echo "I don't like contractions inside shell scripts."
I don't like contractions inside shell scripts.
```

**General rule for quoting any string with no substitutions**:
1. Change all `'` to `'\''` (single quote, backslash, single quote, single quote)
2. Enclose the entire string in single quotes

```bash
$ echo 'this isn'\''t a forward slash: \'
this isn't a forward slash: \
```

:::info[Parameter Counting]
When you quote a string, the shell treats everything inside as a **single parameter**. Therefore:
- `a b c` counts as three parameters
- `a "b c"` is only two parameters
:::

## 3. Special Variables

Shell scripts use special variables to access arguments and runtime information.

### 3.1. Individual Arguments: `$1`, `$2`, ...

Variables named as positive integers contain script parameters (arguments).

```bash
#!/bin/sh
echo First argument: $1
echo Third argument: $3
```

Running this script:

```bash
$ ./pshow one two three
First argument: one
Third argument: three
```

**The `shift` command** removes `$1` and advances all other arguments:

```bash
#!/bin/sh
echo Argument: $1
shift
echo Argument: $1
shift
echo Argument: $1
```

```bash
$ ./shiftex one two three
Argument: one
Argument: two
Argument: three
```

### 3.2. Number of Arguments: `$#`

The `$#` variable holds the count of arguments passed to the script.

```bash
#!/bin/sh
echo "You passed $# arguments"
```

This is especially important when using `shift` in loops. When `$#` is 0, no arguments remain.

### 3.3. All Arguments: `$@`

The `$@` variable represents all of a script's arguments. It's useful for passing them to commands inside the script.

```bash
#!/bin/sh
gs -q -dBATCH -dNOPAUSE -dSAFER -sOutputFile=- -sDEVICE=pnmraw $@
```

:::tip[Long Lines]
If a script line gets too long, split it with a backslash:

```bash
#!/bin/sh
gs -q -dBATCH -dNOPAUSE -dSAFER \
   -sOutputFile=- -sDEVICE=pnmraw $@
```
:::

### 3.4. Script Name: `$0`

The `$0` variable holds the script name. Use it for diagnostic messages:

```bash
echo $0: bad option $BADPARM
```

To send errors to standard error (not standard output):

```bash
echo $0: bad option $BADPARM 1>&2
```

### 3.5. Process ID: `$$`

The `$$` variable holds the shell's process ID. Useful for creating unique temporary files:

```bash
TMPFILE=/tmp/myscript.$$
```

### 3.6. Exit Code: `$?`

The `$?` variable holds the exit code of the last executed command.

```bash
$ ls / > /dev/null
$ echo $?
0

$ ls /nonexistent > /dev/null
ls: /nonexistent: No such file or directory
$ echo $?
1
```

:::warning[Use Exit Codes Immediately]
You must use or store the exit code immediately after running a command. The next command you run overwrites it!

```bash
$ echo $?  # Returns 0
$ echo $?  # Returns 0 again (from the previous echo)
```
:::

<CardGrid
  title="Special Shell Variables"
  cards={[
    {
      title: 'Arguments',
      items: [
        '$1, $2, ... - Individual arguments',
        '$# - Count of arguments',
        '$@ - All arguments',
        '$0 - Script name',
        'shift - Advance arguments'
      ],
      color: colors.blue
    },
    {
      title: 'Process Info',
      items: [
        '$$ - Current shell PID',
        '$? - Last exit code',
        '$! - Last background PID',
        '$- - Shell options',
        '$_ - Last argument'
      ],
      color: colors.green
    },
    {
      title: 'Environment',
      items: [
        '$HOME - Home directory',
        '$PATH - Command search path',
        '$PWD - Current directory',
        '$OLDPWD - Previous directory',
        '$USER - Current username'
      ],
      color: colors.purple
    }
  ]}
/>

## 4. Exit Codes

When a Unix program finishes, it leaves an **exit code** for the parent process.

**What it is**: An exit code is a numeric value (0-255) that indicates whether a program succeeded or failed.

**Why it matters**: Exit codes enable scripts to make decisions based on command success, creating robust error handling.

**How it works**: By convention, 0 means success, and any non-zero value indicates an error (though some programs use specific codes for different outcomes).

```bash
$ ls / > /dev/null
$ echo $?
0

$ ls /asdfasdf > /dev/null
ls: /asdfasdf: No such file or directory
$ echo $?
1
```

### 4.1. Using Exit Codes in Scripts

Terminate your script with an error code when needed:

```bash
if [ ! -f "$filename" ]; then
    echo "$0: file not found: $filename" 1>&2
    exit 1
fi
```

:::info[Special Cases]
Some programs use non-zero exit codes for normal conditions:
- `grep` returns 0 if pattern found, 1 if not found, 2 for errors
- `diff` returns 0 if files identical, 1 if different, 2 for errors

Always check the manual page's EXIT VALUE or DIAGNOSTICS section.
:::

## 5. Conditionals

### 5.1. The `if` Statement

Conditionals in the Bourne shell execute commands based on exit codes.

```bash
#!/bin/sh
if [ $1 = hi ]; then
    echo 'The first argument was "hi"'
else
    echo -n 'The first argument was not "hi" -- '
    echo It was '"'$1'"'
fi
```

**What it is**: The `if` statement runs a command and executes different code based on its exit code.

**Why it matters**: This enables scripts to make decisions and handle different scenarios automatically.

**How it works**:
1. Shell runs the command after `if` and collects its exit code
2. If exit code is 0, shell executes commands after `then`
3. If exit code is non-zero and `else` exists, shell executes those commands
4. Conditional ends at `fi`

<ProcessFlow
  title="Conditional Execution Flow"
  steps={[
    { title: 'Run test command', description: '[ $1 = hi ]' },
    { title: 'Check exit code', description: 'Success (0) or failure (non-zero)?' },
    { title: 'Execute branch', description: 'then block or else block' },
    { title: 'Continue', description: 'Resume after fi' }
  ]}
/>

### 5.2. The Test Command: `[`

The `[` character is an actual program (also known as `test`). It's not shell syntax!

```bash
if [ $1 = hi ]; then
    echo 'The first argument was "hi"'
fi
```

The semicolon before `then` marks the end of the test command. Without it, the shell would pass `then` as a parameter to `[`.

You can avoid the semicolon by placing `then` on a separate line:

```bash
if [ $1 = hi ]
then
    echo 'The first argument was "hi"'
fi
```

### 5.3. Protecting Against Empty Parameters

If `$1` is empty, the test `[ $1 = hi ]` becomes `[ = hi ]`, which causes an error.

**Fix by quoting the parameter**:

```bash
if [ "$1" = hi ]; then
```

Or use the traditional form:

```bash
if [ x"$1" = x"hi" ]; then
```

Both ensure that even if `$1` is empty, the test is valid.

### 5.4. Other Commands for Tests

Any command can be used in an `if` statement:

```bash
#!/bin/sh
if grep -q daemon /etc/passwd; then
    echo The daemon user is in the passwd file.
else
    echo There is a big problem. daemon is not in the passwd file.
fi
```

### 5.5. The `elif` Keyword

String multiple conditions together with `elif`:

```bash
#!/bin/sh
if [ "$1" = "hi" ]; then
    echo 'The first argument was "hi"'
elif [ "$2" = "bye" ]; then
    echo 'The second argument was "bye"'
else
    echo -n 'The first argument was not "hi" and the second was not "bye"-- '
    echo They were '"'$1'"' and '"'$2'"'
fi
```

Control flows through the **first successful** conditional only.

:::tip[Use case Instead]
Don't get carried away with `elif`. For multiple string comparisons, the `case` statement is often clearer.
:::

### 5.6. Logical Constructs: `&&` and `||`

**AND construct** (`&&`): Run second command only if first succeeds.

```bash
command1 && command2
```

**OR construct** (`||`): Run second command only if first fails.

```bash
command1 || command2
```

**In conditionals**:

```bash
#!/bin/sh
if [ "$1" = hi ] || [ "$1" = bye ]; then
    echo 'The first argument was "'$1'"'
fi
```

**Alternative syntax with test command**:

```bash
#!/bin/sh
if [ "$1" = hi -o "$1" = bye ]; then
    echo 'The first argument was "'$1'"'
fi
```

**Negation** with `!`:

```bash
#!/bin/sh
if [ ! "$1" = hi ]; then
    echo 'The first argument was not hi'
fi
```

### 5.7. Testing Conditions

The `[` command supports many types of tests.

#### File Tests

Check file properties:

```bash
[ -f file ]  # True if file is a regular file
[ -e file ]  # True if file exists
[ -s file ]  # True if file is not empty
```

**File type operators**:

| Operator | Tests for |
|----------|-----------|
| `-f` | Regular file |
| `-d` | Directory |
| `-h` | Symbolic link |
| `-b` | Block device |
| `-c` | Character device |
| `-p` | Named pipe |
| `-S` | Socket |

**Permission operators**:

| Operator | Permission |
|----------|------------|
| `-r` | Readable |
| `-w` | Writable |
| `-x` | Executable |
| `-u` | Setuid |
| `-g` | Setgid |
| `-k` | Sticky bit |

**Binary operators** (compare two files):

```bash
[ file1 -nt file2 ]  # True if file1 newer than file2
[ file1 -ot file2 ]  # True if file1 older than file2
[ file1 -ef file2 ]  # True if same inode
```

#### String Tests

```bash
[ str1 = str2 ]   # True if strings equal
[ str1 != str2 ]  # True if strings not equal
[ -z str ]        # True if string empty
[ -n str ]        # True if string not empty
```

#### Arithmetic Tests

Use arithmetic operators for numeric comparisons:

| Operator | Meaning |
|----------|---------|
| `-eq` | Equal to |
| `-ne` | Not equal to |
| `-lt` | Less than |
| `-gt` | Greater than |
| `-le` | Less than or equal to |
| `-ge` | Greater than or equal to |

```bash
[ 01 -eq 1 ]  # True (numeric equality)
[ 01 = 1 ]    # False (string equality)
```

:::warning[String vs Numeric Equality]
The `=` operator compares strings, not numbers. Use `-eq` for numeric comparisons!
:::

### 5.8. The `case` Statement

The `case` statement matches strings against patterns without executing test commands.

```bash
#!/bin/sh
case $1 in
    bye)
        echo Fine, bye.
        ;;
    hi|hello)
        echo Nice to see you.
        ;;
    what*)
        echo Whatever.
        ;;
    *)
        echo 'Huh?'
        ;;
esac
```

**How it works**:
1. Script matches `$1` against each pattern (ending with `)`)
2. If a match is found, shell executes commands until `;;`
3. Shell skips to `esac` (end of case)

**Pattern matching**:
- Single string: `bye)`
- Multiple options: `hi|hello)`
- Wildcards: `what*)`
- Default case: `*)`

:::warning[Syntax Reminder]
Always end each case with `;;` to avoid syntax errors!
:::

<CardGrid
  title="Shell Script Conditional Constructs"
  cards={[
    {
      title: 'if/then/else',
      items: [
        'Based on exit codes',
        'Use [ ] for tests',
        'elif for multiple conditions',
        'Quote variables!',
        'Good for command results'
      ],
      color: colors.blue
    },
    {
      title: 'case Statement',
      items: [
        'Pattern matching',
        'No exit code testing',
        'Cleaner than many elifs',
        'Supports wildcards',
        'Good for string matching'
      ],
      color: colors.green
    },
    {
      title: '&& and ||',
      items: [
        'Quick one-liners',
        'AND and OR logic',
        'Chain commands',
        'Exit code based',
        'Good for simple checks'
      ],
      color: colors.purple
    }
  ]}
/>

## 6. Loops

### 6.1. The `for` Loop

The `for` loop iterates over a list of values.

```bash
#!/bin/sh
for str in one two three four; do
    echo $str
done
```

**How it works**:
1. Sets variable `str` to first value (`one`)
2. Runs commands between `do` and `done`
3. Returns to `for` line, sets `str` to next value
4. Repeats until all values are processed

Output:
```
one
two
three
four
```

**Common pattern - iterating over files**:

```bash
for filename in *; do
    if [ -f $filename ]; then
        ls -l $filename
        file $filename
    else
        echo $filename is not a regular file.
    fi
done
```

### 6.2. The `while` Loop

The `while` loop continues as long as a command returns success (exit code 0).

```bash
#!/bin/sh
FILE=/tmp/whiletest.$$;
echo firstline > $FILE

while tail -10 $FILE | grep -q firstline; do
    echo -n Number of lines in $FILE:' '
    wc -l $FILE | awk '{print $1}'
    echo newline >> $FILE
done

rm -f $FILE
```

This script adds lines to `$FILE` until `firstline` no longer appears in the last 10 lines.

**Breaking out**: Use the `break` statement to exit a loop early.

**The `until` loop**: Works like `while` but breaks when it encounters a **zero** exit code (opposite of `while`).

:::warning[When Not to Use while]
If you find yourself needing complex `while` loops, you should probably use a language like Python or awk instead.
:::

## 7. Command Substitution

Command substitution redirects a command's output back to the shell's command line.

**What it is**: Command substitution captures the output of one command and uses it as input to another command or stores it in a variable.

**Why it matters**: It enables dynamic script behavior based on command output.

**How it works**: Enclose a command in `$()` and the shell replaces it with the command's output.

```bash
#!/bin/sh
FLAGS=$(grep ^flags /proc/cpuinfo | sed 's/.*://' | head -1)
echo Your processor supports:
for f in $FLAGS; do
    case $f in
        fpu)   MSG="floating point unit" ;;
        3dnow) MSG="3DNOW graphics extensions" ;;
        mtrr)  MSG="memory type range register" ;;
        *)     MSG="unknown" ;;
    esac
    echo $f: $MSG
done
```

You can use single quotes and pipelines inside command substitution. The shell executes the entire pipeline and captures the final output.

:::tip[Alternative Syntax]
The traditional syntax uses backticks: `` `command` ``. The `$()` syntax is newer, POSIX-standard, and easier to read and nest.
:::

:::warning[Don't Overuse]
- Don't use `$(ls)` when `*` glob expansion works
- Consider pipelines with `xargs` instead of command substitution for many files
- Use `find -exec` for complex file operations
:::

## 8. Temporary File Management

### 8.1. Using `mktemp`

Create unique temporary files to avoid conflicts:

```bash
#!/bin/sh
TMPFILE1=$(mktemp /tmp/im1.XXXXXX)
TMPFILE2=$(mktemp /tmp/im2.XXXXXX)

cat /proc/interrupts > $TMPFILE1
sleep 2
cat /proc/interrupts > $TMPFILE2
diff $TMPFILE1 $TMPFILE2
rm -f $TMPFILE1 $TMPFILE2
```

The `XXXXXX` pattern is replaced with unique characters, and `mktemp` creates an empty file with that name.

**Benefits**:
- Guaranteed unique filenames
- Prevents race conditions
- No conflicts between scripts

### 8.2. Signal Handlers with `trap`

Problem: If a script is interrupted (Ctrl-C), temporary files might be left behind.

Solution: Use `trap` to catch signals and clean up:

```bash
#!/bin/sh
TMPFILE1=$(mktemp /tmp/im1.XXXXXX)
TMPFILE2=$(mktemp /tmp/im2.XXXXXX)
trap "rm -f $TMPFILE1 $TMPFILE2; exit 1" INT

# Rest of script...
```

The `trap` command runs the cleanup code when the INT signal (Ctrl-C) is received. You must explicitly `exit` in the handler, or the shell continues running.

:::tip[Default Template]
If you don't provide a template to `mktemp`, it uses `/tmp/tmp.XXXXXX` by default.
:::

## 9. Here Documents

Here documents feed large blocks of text to commands without multiple `echo` statements.

```bash
#!/bin/sh
DATE=$(date)
cat <<EOF
Date: $DATE

The output above is from the Unix date command.
It's not a very interesting command.
EOF
```

**How it works**:
1. `<<EOF` tells the shell to redirect subsequent lines to the command's standard input
2. Redirection continues until the ending marker (`EOF`) appears alone on a line
3. The shell expands variables inside here documents

The marker can be any string, but convention uses uppercase. Use the same marker at start and end.

:::info[Use Case]
Here documents are especially useful for:
- Printing multi-line messages
- Generating configuration files
- Feeding input to interactive programs
- Creating multi-line strings with variable expansion
:::

## 10. Important Shell Script Utilities

### 10.1. `basename`

Strip directory paths and file extensions:

```bash
$ basename example.html .html
example

$ basename /usr/local/bin/example
example
```

**In scripts** - converting file formats:

```bash
#!/bin/sh
for file in *.gif; do
    # Exit if there are no files
    if [ ! -f $file ]; then
        exit
    fi
    b=$(basename $file .gif)
    echo Converting $b.gif to $b.png...
    giftopnm $b.gif | pnmtopng > $b.png
done
```

### 10.2. `awk`

The `awk` command is a powerful programming language, but most people use it for one thing: extracting fields.

```bash
$ ls -l | awk '{print $5}'
```

This prints the fifth field (file size) from each line of `ls` output.

**What it is**: awk is a pattern-scanning and text-processing language.

**Why it matters**: It excels at extracting and manipulating columnar data.

**How it works**: awk splits each line into fields (by whitespace by default) and lets you access them as `$1`, `$2`, etc.

:::info[Further Learning]
For complex text processing, consider learning more awk or using Python. See *The AWK Programming Language* by Aho, Kernighan, and Weinberger.
:::

### 10.3. `sed`

The stream editor (`sed`) automatically edits text streams.

**Common operation - substitution**:

```bash
$ sed 's/exp/text/'           # Replace first match per line
$ sed 's/:/%/' /etc/passwd    # Replace first colon with %
$ sed 's/:/%/g' /etc/passwd   # Replace all colons (g = global)
```

**Deleting lines**:

```bash
$ sed 3,6d /etc/passwd        # Delete lines 3-6
$ sed '/exp/d'                # Delete lines matching regex
```

**Address and operation format**:
- `3,6` is the address (range of lines)
- `d` is the operation (delete)
- `s/old/new/` is substitution

Most common operations: `s` (substitute) and `d` (delete).

### 10.4. `xargs`

Run commands on many files when the argument list is too large for the shell.

```bash
$ find . -name '*.gif' -print | xargs file
```

**Secure form** (handles filenames with spaces and newlines):

```bash
$ find . -name '*.gif' -print0 | xargs -0 file
```

The `-print0` and `-0` options use NULL characters as delimiters instead of newlines.

:::warning[Security Note]
Always use `-print0` and `-0` in scripts to handle filenames with spaces or special characters safely.
:::

**Alternative - `find -exec`**:

```bash
$ find . -name '*.gif' -exec file {} \;
```

The `{}` is replaced with each filename, and `\;` marks the end of the command.

### 10.5. `expr`

Perform arithmetic operations in shell scripts:

```bash
$ expr 1 + 2
3
```

:::warning[Performance]
`expr` is clumsy and slow. If you need frequent arithmetic, use a language like Python instead of shell scripts.
:::

### 10.6. `exec`

The `exec` command replaces the current shell process with another program.

```bash
$ exec cat
```

After running this, the shell is **gone**, replaced by `cat`. When you exit `cat` (Ctrl-D or Ctrl-C), your terminal window closes because its shell process no longer exists.

**Use case**: Save system resources in scripts by replacing the shell with the final command instead of running it as a child process. But remember: there's no return!

<CardGrid
  title="Essential Shell Utilities"
  cards={[
    {
      title: 'Text Processing',
      items: [
        'awk - Extract fields',
        'sed - Stream editing',
        'grep - Pattern matching',
        'cut - Column extraction',
        'tr - Character translation'
      ],
      color: colors.blue
    },
    {
      title: 'File Operations',
      items: [
        'basename - Strip paths',
        'dirname - Extract directory',
        'find - Locate files',
        'xargs - Batch commands',
        'mktemp - Temp files'
      ],
      color: colors.green
    },
    {
      title: 'Advanced',
      items: [
        'expr - Arithmetic',
        'exec - Replace process',
        'trap - Signal handling',
        'test - Conditionals',
        'read - User input'
      ],
      color: colors.purple
    }
  ]}
/>

## 11. Subshells

A subshell is a new shell process created to run commands without affecting the parent shell's environment.

**What it is**: A subshell is a child shell process with a copy of the parent's environment.

**Why it matters**: Make temporary environment changes without polluting your main shell.

**How it works**: Changes to variables, directories, or other environment settings in the subshell disappear when it exits.

**Syntax**: Enclose commands in parentheses:

```bash
$ (cd uglydir; uglyprogram)
```

This runs `uglyprogram` in `uglydir` but doesn't change the current shell's directory.

**Temporary PATH modification**:

```bash
$ (PATH=/usr/confusing:$PATH; uglyprogram)
```

**Shorthand for single variable**:

```bash
$ PATH=/usr/confusing:$PATH uglyprogram
```

**Practical example** - duplicating directory trees:

```bash
$ tar cf - orig | (cd target; tar xvf -)
```

This archives `orig` and unpacks it in `target`, preserving permissions and ownership.

:::warning[Safety Check]
Always verify that the target directory exists and is separate from the source:

```bash
if [ -d orig -a ! orig -ef target ]; then
    tar cf - orig | (cd target; tar xvf -)
fi
```
:::

## 12. Including Other Files in Scripts

Source external files to reuse code and share configurations:

```bash
. config.sh
```

The dot (`.`) operator runs commands from the file in the **current shell**, not a subshell.

**What it is**: Sourcing executes another script's commands in the current shell environment.

**Why it matters**: Share variables, functions, and configuration across multiple scripts.

**How it works**: Unlike running a script as a command, sourcing doesn't create a new shell. All variables and functions become part of the current shell.

**Use cases**:
- Shared configuration files
- Library functions
- Common variable definitions
- Initialization scripts

## 13. Reading User Input

The `read` command captures a line of text from standard input:

```bash
$ read var
```

After the user types and presses Enter, the input is stored in `$var`.

**Interactive confirmation**:

```bash
#!/bin/sh
echo -n "Are you sure? (y/n) "
read answer
if [ "$answer" = "y" ]; then
    echo "Proceeding..."
else
    echo "Cancelled."
fi
```

:::tip[Use Cases]
The `read` command is useful for:
- Simple user prompts
- Confirmation dialogs
- Interactive configuration
- Menu systems
:::

:::warning[Don't Overuse]
If you find yourself writing complex interactive scripts with many `read` commands, consider using a programming language with better I/O facilities, like Python.
:::

## 14. When (Not) to Use Shell Scripts

### 14.1. Shell Scripts Excel At

- File manipulation and batch operations
- Automating command-line tasks
- System administration
- Simple text processing
- Gluing programs together
- Quick prototypes

### 14.2. Use Another Language When

- String operations become complex
- You need arithmetic computations
- Working with databases
- Building large applications
- Performance is critical
- You need data structures (arrays, hashes, objects)

<ProcessFlow
  title="Choosing the Right Tool"
  steps={[
    { title: 'Define task', description: 'What are you trying to accomplish?' },
    { title: 'Assess complexity', description: 'File ops? Or complex logic?' },
    { title: 'Choose tool', description: 'Shell, Python, Perl, C, etc.' },
    { title: 'Start simple', description: 'Begin with shell, migrate if needed' }
  ]}
/>

### 14.3. Recommended Alternatives

**Python**:
- General-purpose scripting
- Complex logic and data structures
- Text processing
- Web applications

**Perl**:
- Heavy text manipulation
- Regular expressions
- Legacy system administration

**awk**:
- Column-based data extraction
- Report generation
- Log file analysis

**C/C++/Rust**:
- Performance-critical code
- System programming
- Resource-constrained environments

:::info[The Right Tool]
Remember what shell scripts do best: manipulate simple files and commands. If your script looks convoluted or involves complicated string/arithmetic operations, look to a different language.
:::

## Summary

Shell scripting is a powerful tool for automation and system administration. You've learned:

1. **Basics**: Shebangs, comments, permissions, and script execution
2. **Quoting**: Single quotes, double quotes, and literals
3. **Variables**: Arguments, special variables, and environment
4. **Exit Codes**: Success/failure indicators and error handling
5. **Conditionals**: if/then/else, test conditions, and case statements
6. **Loops**: for and while loops for iteration
7. **Advanced Features**: Command substitution, here documents, subshells
8. **Utilities**: basename, awk, sed, xargs, and more
9. **Best Practices**: When to use shell scripts and when to use alternatives

Keep your scripts short, well-commented, and focused on what shells do best: file manipulation and command automation. When complexity grows, don't hesitate to reach for a more appropriate tool.
