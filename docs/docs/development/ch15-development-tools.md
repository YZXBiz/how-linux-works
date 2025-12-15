---
sidebar_position: 1
title: "Development Tools"
description: "Master the C compiler, libraries, make system, and scripting languages essential for Linux development and system management"
---

import { ProcessFlow, StackDiagram, CardGrid, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# Development Tools

Linux is very popular with programmers, not just due to the overwhelming array of tools and environments available but also because the system is exceptionally well documented and transparent. On a Linux machine, you don't have to be a programmer to take advantage of development tools.

This is particularly important because development tools play a larger role in managing Linux systems than in other operating systems. At the very least, you should be able to identify development utilities and have some idea of how to run them.

:::info What You'll Learn
This chapter covers the essential development tools you'll encounter on Linux systems. The examples will be very simple and don't require programming knowledge. The discussion of **shared libraries** is likely the most important topic for system administrators.
:::

## 1. The C Compiler

Knowing how to use the C programming language compiler can give you a great deal of insight into the origin of the programs that you see on your Linux system. Most Linux utilities and many applications are written in C or C++.

C programs follow a traditional development process. You write programs, you compile them, and they run. When you write C program code and want to run it, you must compile human-readable code into a binary low-level form that the computer's processor understands.

### 1.1. Understanding the Compilation Process

**What it is:** The code that you write is called **source code**, and can encompass many files.

**Why it matters:** Unlike scripting languages (discussed later), C requires compilation before execution. This compilation step transforms human-readable code into machine code.

**How it works:** The C compiler reads your .c source files and produces executable binary files that the processor can directly execute.

:::warning Installation Required
Most distributions do not include C compiler tools by default. Install them using:
- **Debian/Ubuntu:** `build-essential` package
- **Fedora/CentOS:** "Development Tools" yum groupinstall
- **Search fallback:** Look for "gcc" or "C compiler" packages
:::

### 1.2. Basic Compilation Example

The C compiler executable on most Unix systems is the GNU C compiler, **gcc** (often referred to by the traditional name **cc**). The newer **clang** compiler from the LLVM project is also gaining popularity.

C source code files end with **.c**. Here's a classic example from *The C Programming Language* by Kernighan and Ritchie:

```c
#include <stdio.h>

int main() {
    printf("Hello, World.\n");
}
```

Save this source code in a file called `hello.c` and compile it:

```bash
$ cc hello.c
```

This creates an executable named `a.out`. To give it a better name, use the `-o` option:

```bash
$ cc -o hello hello.c
```

<ProcessFlow
  title="Simple C Compilation Process"
  steps={[
    {
      label: 'Write Source Code',
      detail: 'Create hello.c with C code',
      color: colors.blue
    },
    {
      label: 'Compile',
      detail: 'cc -o hello hello.c',
      color: colors.green
    },
    {
      label: 'Execute',
      detail: './hello runs the program',
      color: colors.purple
    }
  ]}
/>

### 1.3. Compiling Multiple Source Files

Most C programs are too large to reasonably fit within a single source code file. Mammoth files become too disorganized for the programmer to manage, and compilers sometimes even have trouble processing large files.

Developers typically separate source code into component pieces, giving each piece its own file. When compiling multiple .c files, you don't create an executable right away. Instead, use the compiler's **-c** option on each file to create **object files** containing binary object code.

#### 1.3.1. Example: Two-File Program

Consider two files:

**main.c:**
```c
void hello_call();

int main() {
    hello_call();
}
```

**aux.c:**
```c
#include <stdio.h>

void hello_call() {
    printf("Hello, World.\n");
}
```

Compile them to object files:

```bash
$ cc -c main.c
$ cc -c aux.c
```

After these commands complete, you'll have two object files: **main.o** and **aux.o**.

#### 1.3.2. Understanding Object Files

**What they are:** An object file is a binary file that a processor can almost understand, except that there are still a few loose ends.

**What's missing:**
1. The operating system doesn't know how to start up an object file
2. You need to combine several object files and system libraries to make a complete program

**The solution:** Run the **linker** (the `ld` command) to create a complete executable.

#### 1.3.3. Linking Object Files

Programmers rarely use `ld` directly because the C compiler knows how to run the linker program. To create an executable called `myprog`:

```bash
$ cc -o myprog main.o aux.o
```

<ProcessFlow
  title="Multi-File Compilation and Linking"
  steps={[
    {
      label: 'Compile main.c',
      detail: 'cc -c main.c → main.o',
      color: colors.blue
    },
    {
      label: 'Compile aux.c',
      detail: 'cc -c aux.c → aux.o',
      color: colors.blue
    },
    {
      label: 'Link Objects',
      detail: 'cc -o myprog main.o aux.o',
      color: colors.green
    },
    {
      label: 'Executable Ready',
      detail: './myprog can now run',
      color: colors.purple
    }
  ]}
/>

:::info Why Use Make?
As the number of source files increases, tracking compilation becomes challenging. The **make** system (Section 2) is the traditional Unix standard for managing and automating compiles.
:::

## 2. Linking with Libraries

Running the compiler on source code usually doesn't result in enough object code to create a useful executable program all by itself. You need **libraries** to build complete programs.

### 2.1. What Are Libraries?

**Definition:** A C library is a collection of common precompiled components that you can build into your program. It's really not much more than a bundle of object files (along with some header files).

**Example:** There's a standard math library that many executables use because it provides trigonometric functions and other mathematical operations.

**When they matter:** Libraries come into play primarily at **link time**, when the linker program creates an executable from object files.

### 2.2. Common Linking Errors

If you forget to link against a required library, you'll see linker errors like this:

```
badobject.o(.text+0x28): undefined reference to 'initscr'
```

**What this means:** The linker examined `badobject.o` and couldn't find the `initscr()` function, so it couldn't create the executable.

**How to fix it:**
1. Identify the missing library (often through web search or manual pages)
2. In this case, `initscr()` comes from the **curses** library
3. Link against it using the `-l` option

### 2.3. Linking Against Libraries

Libraries reside in various directories, but most are in a subdirectory named **lib**. The system default location is **/usr/lib**.

For the curses library:
- Library file: `libcurses.a`
- Library name: `curses` (remove "lib" prefix and ".a" suffix)

To link against curses:

```bash
$ cc -o badobject badobject.o -lcurses
```

#### 2.3.1. Nonstandard Library Locations

For libraries in nonstandard locations, use the **-L** option to specify the library directory.

Example: If `libcrud.a` is in `/usr/junk/lib`:

```bash
$ cc -o badobject badobject.o -lcurses -L/usr/junk/lib -lcrud
```

:::tip Finding Library Contents
To search a library for a particular function:
```bash
$ nm --defined-only libcurses.a
```

On many distributions, you can also use `less` to view library contents. Use `locate` to find library locations (often in architecture-specific subdirectories like `/usr/lib/x86_64-linux-gnu/`).
:::

### 2.4. The C Standard Library

There's a library on your system called the **C standard library**, containing fundamental components considered a part of the C programming language.

**Basic file:** `libc.a`

**Automatic inclusion:** When you compile a program, this library is always included unless you specifically exclude it.

**Shared version:** Most programs on your system use the shared version.

## 3. Working with Shared Libraries

Understanding shared libraries is crucial for Linux system management. This section covers one of the most important topics in this chapter.

### 3.1. Static vs. Shared Libraries

#### 3.1.1. Static Libraries (.a files)

**What they are:** Library files ending with `.a` (such as `libcurses.a`).

**How linking works:** When you link a program against a static library, the linker **copies** the necessary machine code from the library file into your executable.

**Independence:** Once linked, the final executable no longer needs the original library file when it runs.

**Stability:** The executable's behavior is not subject to change if the .a file changes.

#### 3.1.2. Problems with Static Libraries

Static libraries are wasteful in several ways:

1. **Disk space:** Library sizes are always increasing, as is the number of libraries in use
2. **Memory:** Multiple programs can't share the same code
3. **Updates:** If a static library is later found to be inadequate or insecure, there's no way to change the executables that had been linked against it (short of recompiling every executable)

#### 3.1.3. Shared Libraries Solution

**What they are:** Libraries that multiple programs can use simultaneously.

**How linking works:** Linking a program against a shared library doesn't copy the code into the final executable. It just adds **references** to names in the code of the library file.

**Runtime loading:** When you run the program, the system loads the library's code into the process memory space only when necessary.

**Memory sharing:** Many processes can share the same shared library code in memory.

**Updates:** If you need to slightly modify the library code, you can generally do so without recompiling any programs.

<StackDiagram
  title="Static vs. Shared Libraries in Memory"
  layers={[
    { title: 'Program A (static lib)', color: colors.blue, items: ['Contains copy of library code'] },
    { title: 'Program B (static lib)', color: colors.blue, items: ['Contains another copy'] },
    { title: 'Program C (shared lib)', color: colors.green, items: ['References shared library'] },
    { title: 'Program D (shared lib)', color: colors.green, items: ['References same shared library'] },
    { title: 'Shared Library Code', color: colors.purple, items: ['One copy in memory for all'] }
  ]}
/>

:::info System Updates and Shared Libraries
When your update manager asks you to reboot after updates, it's sometimes to ensure that every part of your system is using new versions of shared libraries.
:::

### 3.2. Four Essential Shared Library Skills

To bring shared libraries under control, you need to know:

1. How to list the shared libraries that an executable needs
2. How an executable looks for shared libraries
3. How to link a program against a shared library
4. How to avoid common shared library pitfalls

### 3.3. Listing Shared Library Dependencies

Shared library files usually reside in the same places as static libraries. The two standard library directories on a Linux system are **/lib** and **/usr/lib**.

**Naming convention:** A shared library has a suffix containing **.so** (shared object), such as `libc-2.15.so` and `libc.so.6`.

**How to list dependencies:** Use `ldd prog`, where prog is the executable name.

Example for the shell:

```bash
$ ldd /bin/bash
linux-vdso.so.1 (0x00007ffff31cc000)
libgtk3-nocsd.so.0 => /usr/lib/x86_64-linux-gnu/libgtk3-nocsd.so.0 (0x00007f72bf3a4000)
libtinfo.so.5 => /lib/x86_64-linux-gnu/libtinfo.so.5 (0x00007f72bf17a000)
libdl.so.2 => /lib/x86_64-linux-gnu/libdl.so.2 (0x00007f72bef76000)
libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f72beb85000)
libpthread.so.0 => /lib/x86_64-linux-gnu/libpthread.so.0 (0x00007f72be966000)
/lib64/ld-linux-x86-64.so.2 (0x00007f72bf8c5000)
```

**Understanding the output:**
- **Left side (before =>):** Library names the executable knows
- **Right side (after =>):** Where `ld.so` finds the library
- **Final line:** Location of `ld.so` itself (the runtime dynamic linker/loader)

### 3.4. How ld.so Finds Shared Libraries

The **runtime dynamic linker/loader** (`ld.so`) finds and loads shared libraries for a program at runtime.

**Search order:**

1. **Executable's rpath:** Preconfigured runtime library search path (if it exists)
2. **System cache:** `/etc/ld.so.cache` - contains libraries in standard locations
3. **LD_LIBRARY_PATH:** Environment variable (discussed in Section 3.6)

#### 3.4.1. The System Cache

**Cache file:** `/etc/ld.so.cache`

**Configuration file:** `/etc/ld.so.conf`

**How it works:** This is a fast cache of library file names found in directories listed in `/etc/ld.so.conf`.

:::note Configuration Includes
As typical of Linux configuration files, `ld.so.conf` may include files from a directory such as `/etc/ld.so.conf.d`.
:::

Each line in `ld.so.conf` (or included files) is a directory name to include in the cache:

```
/lib/i686-linux-gnu
/usr/lib/i686-linux-gnu
```

**Implicit directories:** The standard library directories `/lib` and `/usr/lib` are always included; you don't need to list them.

#### 3.4.2. Rebuilding the Cache

If you alter `ld.so.conf` or change a shared library directory, rebuild `/etc/ld.so.cache`:

```bash
# ldconfig -v
```

The `-v` option provides detailed information on libraries that `ldconfig` adds to the cache and any changes it detects.

:::warning Don't Overuse /etc/ld.so.conf
Don't get into the habit of adding every library to `/etc/ld.so.conf`. You should know what shared libraries are in the system cache. If you put every obscure library directory into the cache, you risk conflicts and an extremely disorganized system.

**Better approach:** When compiling software that needs an obscure library path, give your executable a built-in runtime library search path.
:::

### 3.5. Linking Programs Against Shared Libraries

When you have a shared library in a nonstandard location, you need to tell the linker about it.

**Example:** Link `myprog` against `libweird.so.1` in `/opt/obscure/lib`:

```bash
$ cc -o myprog myprog.o -Wl,-rpath=/opt/obscure/lib -L/opt/obscure/lib -lweird
```

**Understanding the options:**
- **-Wl,-rpath=/opt/obscure/lib:** Tells the linker to include this directory in the executable's runtime library search path
- **-L/opt/obscure/lib:** Tells the linker where to find the library during linking
- **-lweird:** Links against `libweird`

:::info Changing Runtime Search Path Later
If you need to change the runtime library search path of an existing binary, you can use the **patchelf** program. However, it's generally better to set this at compile time.

**Note:** ELF (Executable and Linkable Format) is the standard format used for executables and libraries on Linux systems.
:::

### 3.6. Avoiding Shared Library Problems

Shared libraries provide remarkable flexibility, but you can abuse them to the point where your system becomes a complete mess.

**Three particularly bad things:**
1. Missing libraries
2. Terrible performance
3. Mismatched libraries

#### 3.6.1. The LD_LIBRARY_PATH Problem

**What it is:** An environment variable that makes `ld.so` search specified directories before anything else when looking for a shared library.

**Why it's tempting:** It's a cheap way to make programs work when you move a library around, if you don't have the program's source code and can't use patchelf.

**Why it's terrible:**

<CardGrid
  title="Problems with LD_LIBRARY_PATH"
  cards={[
    {
      title: 'Performance Hit',
      description: 'The runtime linker must search through entire contents of each directory multiple times',
      color: colors.red
    },
    {
      title: 'Conflicts',
      description: 'The runtime linker looks in these directories for EVERY program, causing library mismatches',
      color: colors.red
    },
    {
      title: 'System-Wide Issues',
      description: 'Setting it in shell startup files affects all programs, not just the one you intended',
      color: colors.red
    }
  ]}
/>

:::danger Never Do This
**Never** set `LD_LIBRARY_PATH` in shell startup files or when compiling software.
:::

#### 3.6.2. Using LD_LIBRARY_PATH Safely (If You Must)

If you must use `LD_LIBRARY_PATH` for a program without source code, use a **wrapper script**.

**Example:** For `/opt/crummy/bin/crummy.bin` that needs libraries in `/opt/crummy/lib`:

Create a wrapper script called `crummy`:

```bash
#!/bin/sh
LD_LIBRARY_PATH=/opt/crummy/lib
export LD_LIBRARY_PATH
exec /opt/crummy/bin/crummy.bin $@
```

**Why this works:** The environment variable is set only for that specific program execution, not system-wide.

#### 3.6.3. Other Shared Library Issues

**API changes:** A library's API may change slightly from one minor version to another, breaking installed software.

**Solutions:**
1. Use a consistent methodology to install shared libraries with `-Wl,-rpath` to create a runtime link path
2. Use static versions of obscure libraries

## 4. Working with Header (Include) Files

C header files are additional source code files that usually contain type and library function declarations. They typically declare functions for the libraries you just saw.

### 4.1. What Are Header Files?

**Example:** `stdio.h` is a header file (seen in Section 1.2).

**File extension:** Header files typically end in `.h`

**Purpose:** They provide declarations that your code needs to use library functions and system calls.

### 4.2. Include File Problems

A great number of compilation problems are related to header files. Most such glitches occur when the compiler can't find header files and libraries.

**Common error:**

```
badinclude.c:1:22: fatal error: notfound.h: No such file or directory
```

**What it means:** The compiler can't find the `notfound.h` header file that `badinclude.c` references.

**Looking at the code (line 1):**

```c
#include <notfound.h>
```

### 4.3. Finding Missing Header Files

**Default location:** `/usr/include` - the compiler always looks here unless you explicitly tell it not to.

**Problem:** If the header file isn't in the default location, you need to tell the compiler where to look.

#### 4.3.1. Specifying Include Directories

If you find `notfound.h` in `/usr/junk/include`, use the **-I** option:

```bash
$ cc -c -I/usr/junk/include badinclude.c
```

Now the compiler will search `/usr/junk/include` in addition to the default locations.

:::info More Help in Chapter 16
You'll learn more about how to find missing include files in Chapter 16.
:::

### 4.4. Double Quotes vs. Angle Brackets

**Angle brackets:** `#include <header.h>` - System include files

**Double quotes:** `#include "myheader.h"` - Local include files

**What double quotes mean:**
- The header file is **not** in a system include directory
- Usually indicates the include file is in the **same directory** as the source file
- If you encounter problems with double quotes, you're probably trying to compile incomplete source code

### 4.5. The C Preprocessor

The C compiler doesn't actually look for include files itself. That task falls to the **C preprocessor**, a program that the compiler runs on your source code before parsing the actual program.

**What it does:** The preprocessor rewrites source code into a form that the compiler understands. It's a tool for making source code easier to read and for providing shortcuts.

**Preprocessor commands:** Called **directives**, they start with the `#` character.

### 4.6. Three Basic Types of Directives

#### 4.6.1. Include Files

```c
#include <filename>
```

**What it does:** Instructs the preprocessor to include an entire file.

**Note:** The compiler's `-I` flag is actually an option for the preprocessor to search a specified directory for include files.

#### 4.6.2. Macro Definitions

```c
#define BLAH something
```

**What it does:** Tells the preprocessor to substitute `something` for all occurrences of `BLAH` in the source code.

**Convention:** Macros appear in all uppercase.

**Warning:** Programmers sometimes use macros whose names look like functions and variables, which can cause headaches.

**Command-line alternative:**

```bash
$ cc -DBLAH=something file.c
```

This `-DBLAH=something` works like the `#define` directive.

#### 4.6.3. Conditionals

Preprocessor conditionals allow you to mark out certain pieces of code.

**Directives:** `#ifdef`, `#if`, and `#endif`

**Example:**

```c
#ifdef DEBUG
fprintf(stderr, "This is a debugging message.\n");
#endif
```

**How it works:**
1. `#ifdef MACRO` checks if the preprocessor macro `MACRO` is defined
2. `#if condition` tests if `condition` is nonzero
3. If the condition is false, the preprocessor doesn't pass the code between `#if` and `#endif` to the compiler

**Common use:** Debug code that only compiles when `DEBUG` is defined.

:::warning Preprocessor Limitations
The C preprocessor doesn't know anything about C syntax, variables, functions, and other elements. It understands only its own macros and directives.
:::

### 4.7. Running the Preprocessor

**Name:** `cpp`

**Alternative:** `gcc -E`

**Note:** You'll rarely need to run the preprocessor by itself.

## 5. Make

A program with more than one source code file or requiring special compiler options is too cumbersome to compile by hand. The traditional Unix compile management utility that addresses this is called **make**.

### 5.1. Why Make Matters

You should know about make if you're running a Unix system because:

1. System utilities sometimes rely on make to operate
2. Many Linux packages are built using make or similar tools
3. Understanding make helps you understand the build process

:::info Beyond This Chapter
This chapter covers only the basics of make. For comprehensive coverage, see *Managing Projects with GNU Make, 3rd edition* by Robert Mecklenburg (O'Reilly, 2005).

Many Linux packages use an additional layer around make, such as the **autotools** system discussed in Chapter 16.
:::

### 5.2. Basic Make Concepts

When you see a file named **Makefile** or **makefile**, you know you're dealing with make.

**The target:** A goal you want to achieve (can be a file like a `.o` file, an executable, or a label).

**Dependencies:** Requirements that must be satisfied before building a target. For example, you need a complete set of `.o` files before you can link your executable.

**Rules:** Instructions for building a target, such as how to go from a `.c` source file to a `.o` object file.

### 5.3. A Sample Makefile

Building on the example from Section 1.3, here's a simple Makefile that builds `myprog` from `aux.c` and `main.c`:

```makefile
# object files
OBJS=aux.o main.o

all: myprog

myprog: $(OBJS)
	$(CC) -o myprog $(OBJS)
```

**Line-by-line breakdown:**

1. **`# object files`** - Comment (lines starting with `#` are comments)
2. **`OBJS=aux.o main.o`** - Macro definition setting OBJS variable
3. **`all: myprog`** - First target (default when you run `make`); depends on `myprog`
4. **`myprog: $(OBJS)`** - Target `myprog` depends on the object files
5. **`$(CC) -o myprog $(OBJS)`** - Command to build `myprog` (**must start with a tab**)

:::danger Tab Character Required
The whitespace before `$(CC)` **must be a tab character**. Make is very strict about this. If you see this error:
```
Makefile:7: *** missing separator. Stop.
```
It means you're missing the tab character.
:::

### 5.4. Running Make

Running make on the Makefile yields:

```bash
$ make
cc -c -o aux.o aux.c
cc -c -o main.o main.c
cc -o myprog aux.o main.o
```

<ProcessFlow
  title="Make Execution Flow"
  steps={[
    {
      label: 'Read Makefile',
      detail: 'Parse targets and dependencies',
      color: colors.blue
    },
    {
      label: 'Build aux.o',
      detail: 'cc -c -o aux.o aux.c',
      color: colors.green
    },
    {
      label: 'Build main.o',
      detail: 'cc -c -o main.o main.c',
      color: colors.green
    },
    {
      label: 'Link myprog',
      detail: 'cc -o myprog aux.o main.o',
      color: colors.purple
    }
  ]}
/>

### 5.5. Built-in Rules

**Question:** How did make know to go from `aux.c` to `aux.o`? The file `aux.c` isn't mentioned in the Makefile.

**Answer:** Make has built-in rules:
1. It knows to look for a `.c` file when you want a `.o` file
2. It knows how to run `cc -c` on that `.c` file to create the `.o` file

This is why make could compile `aux.c` and `main.c` even though they weren't explicitly mentioned.

### 5.6. Dependency Updates

One of make's key features is bringing targets up to date with their dependencies while taking only the minimum necessary steps.

**Example:** Running make twice:

**First run:**
```bash
$ make
cc -c -o aux.o aux.c
cc -c -o main.o main.c
cc -o myprog aux.o main.o
```

**Second run:**
```bash
$ make
make: Nothing to be done for 'all'.
```

**Why:** Make noticed that `myprog` already exists and none of the dependencies changed.

#### 5.6.1. Triggering Rebuilds

**Experiment:**

1. Run `touch aux.c` (updates the timestamp)
2. Run `make` again

**Result:** Make determines that `aux.c` is newer than `aux.o`, so it:
1. Recompiles `aux.o`
2. Since `aux.o` is newer than `myprog`, it rebuilds `myprog`

This chain reaction is typical of make's dependency tracking.

### 5.7. Command-Line Arguments and Options

#### 5.7.1. Specifying a Single Target

You can build just one target:

```bash
$ make aux.o
```

This compiles only `aux.o`, skipping everything else.

#### 5.7.2. Defining Macros

You can define macros on the command line:

```bash
$ make CC=clang
```

This uses `clang` instead of the default `cc` compiler.

**Common use:** Testing preprocessor definitions and libraries with `CFLAGS` and `LDFLAGS` macros.

#### 5.7.3. Make Without a Makefile

If built-in make rules match a target, you can run make without a Makefile.

**Example:** For a simple program `blah.c`:

```bash
$ make blah
cc blah.c -o blah
```

**Limitations:** Works only for elementary C programs. If your program needs a library or special include directory, write a Makefile.

**Useful for:** Learning how to use unfamiliar tools like Fortran, Lex, or Yacc.

#### 5.7.4. Important Make Options

<CardGrid
  title="Essential Make Options"
  cards={[
    {
      title: '-n (Dry Run)',
      description: 'Prints commands needed for build without actually running them. Great for previewing what make will do.',
      color: colors.blue
    },
    {
      title: '-f file',
      description: 'Tells make to read from "file" instead of Makefile or makefile. Useful for alternate build configurations.',
      color: colors.green
    }
  ]}
/>

### 5.8. Standard Macros and Variables

Make has many special macros and variables. The term **macro** typically means something that usually doesn't change after make starts building targets.

#### 5.8.1. Common Macros

You can set these at the start of your Makefile:

**CFLAGS:** C compiler options. When creating object code from a `.c` file, make passes this as an argument to the compiler.

**LDFLAGS:** Linker options. Used when creating an executable from object code.

**LDLIBS:** Library name options (separate from search paths). If you use `LDFLAGS` but don't want to combine library names with search paths, put library names here.

**CC:** The C compiler. The default is `cc`.

**CPPFLAGS:** C preprocessor options. When make runs the C preprocessor, it passes this macro's expansion as an argument.

**CXXFLAGS:** GNU make uses this for C++ compiler flags.

#### 5.8.2. Common Variables

A make variable changes as you build targets. Variables begin with a dollar sign (`$`).

- `$@` - Expands to the current target when inside a rule
- `$<` - Expands to the first dependency of the target when inside a rule
- `$*` - Expands to the basename (stem) of the current target. For example, if you're building `blah.o`, this expands to `blah`.

#### 5.8.3. Example Using Variables

A common pattern for generating `.out` files from `.in` files:

```makefile
.SUFFIXES: .in
.in.out: $<
	myprog $< -o $*.out
```

**How it works:**
- `$<` is the `.in` file (first dependency)
- `$*` is the basename (filename without extension)
- Result: `myprog input.in -o input.out`

:::info More Information
The most comprehensive list of make variables on Linux is in the **make info manual**.
:::

:::warning GNU Make Extensions
GNU make has many extensions, built-in rules, and features that other variants don't have. This is fine for Linux, but if you work on Solaris or BSD, you might encounter surprises.

**Solution:** Multiplatform build systems like **GNU autotools** solve these portability problems.
:::

### 5.9. Conventional Targets

Most developers include several common targets in their Makefiles for auxiliary tasks.

<CardGrid
  title="Standard Makefile Targets"
  cards={[
    {
      title: 'clean',
      description: 'Removes all object files and executables for a fresh start. Example: rm -f $(OBJS) myprog',
      color: colors.blue
    },
    {
      title: 'distclean',
      description: 'Removes everything not in the original distribution, including the Makefile itself (autotools)',
      color: colors.green
    },
    {
      title: 'install',
      description: 'Copies files to proper system locations. Always run "make -n install" first to preview!',
      color: colors.purple
    },
    {
      title: 'test / check',
      description: 'Runs tests to verify everything works after building',
      color: colors.orange
    },
    {
      title: 'depend',
      description: 'Creates dependencies by examining source code. Can modify the Makefile itself. Less common now.',
      color: colors.red
    },
    {
      title: 'all',
      description: 'Commonly the first target in the Makefile, builds everything',
      color: colors.teal
    }
  ]}
/>

**Example clean target:**

```makefile
clean:
	rm -f $(OBJS) myprog
```

### 5.10. Makefile Organization

Even though there are many different Makefile styles, most programmers follow general rules of thumb.

#### 5.10.1. Grouping Libraries and Includes

In the first part of the Makefile, group libraries and includes by package:

```makefile
MYPACKAGE_INCLUDES=-I/usr/local/include/mypackage
MYPACKAGE_LIB=-L/usr/local/lib/mypackage -lmypackage

PNG_INCLUDES=-I/usr/local/include
PNG_LIB=-L/usr/local/lib -lpng
```

Then combine them into compiler and linker flags:

```makefile
CFLAGS=$(CFLAGS) $(MYPACKAGE_INCLUDES) $(PNG_INCLUDES)
LDFLAGS=$(LDFLAGS) $(MYPACKAGE_LIB) $(PNG_LIB)
```

#### 5.10.2. Grouping Object Files

Group object files according to executables:

```makefile
UTIL_OBJS=util.o

BORING_OBJS=$(UTIL_OBJS) boring.o
TRITE_OBJS=$(UTIL_OBJS) trite.o

PROGS=boring trite
```

#### 5.10.3. Executable Targets

```makefile
all: $(PROGS)

boring: $(BORING_OBJS)
	$(CC) -o $@ $(BORING_OBJS) $(LDFLAGS)

trite: $(TRITE_OBJS)
	$(CC) -o $@ $(TRITE_OBJS) $(LDFLAGS)
```

:::tip Separate Targets
Don't combine multiple executables into one rule. Keep them separate so you can:
- Easily move a rule to another Makefile
- Delete an executable
- Avoid incorrect dependencies
:::

:::info Special Object Rules
If you need to define a special rule for an object file, put it just above the rule that builds the executable. If several executables use the same object file, put the object rule above all executable rules.
:::

## 6. Lex and Yacc

You might encounter Lex and Yacc when compiling programs that read configuration files or commands. These tools are building blocks for programming languages.

### 6.1. What Are Lex and Yacc?

<CardGrid
  title="Language Processing Tools"
  cards={[
    {
      title: 'Lex (flex)',
      description: 'A tokenizer that transforms text into numbered tags with labels. GNU/Linux version: flex. May need -ll or -lfl linker flag.',
      color: colors.blue
    },
    {
      title: 'Yacc (bison)',
      description: 'A parser that reads tokens according to a grammar. GNU parser: bison. For Yacc compatibility: bison -y. May need -ly linker flag.',
      color: colors.green
    }
  ]}
/>

## 7. Scripting Languages

A long time ago, the average Unix systems manager only worried about the Bourne shell and awk. Shell scripts continue to be important, but many powerful successors have emerged.

Many systems programs have actually switched from C to scripting languages. For example, modern implementations of `whois` are often written in scripting languages.

### 7.1. Scripting Language Basics

The first line of a script looks like the shebang of a Bourne shell script.

**Python example:**

```python
#!/usr/bin/python
```

**Or using the environment:**

```python
#!/usr/bin/env python
```

**How it works:** An executable text file starting with `#!` is a script. The pathname following `#!` is the scripting language interpreter executable. When Unix tries to run such a file, it runs the program after `#!` with the rest of the file as input.

#### 7.1.1. Simple Script Example

Even this is a valid script:

```bash
#!/usr/bin/tail -2
This program won't print this line,
but it will print this line...
and this line, too.
```

### 7.2. Common Script Problems

#### 7.2.1. Invalid Interpreter Path

If you name the previous script `myscript` but `tail` is in `/bin` instead of `/usr/bin`, you'll get:

```
bash: ./myscript: /usr/bin/tail: bad interpreter: No such file or directory
```

**Solution:** Use the correct path or use `/usr/bin/env` to find the interpreter in your PATH.

:::warning Multiple Arguments in Shebang
Don't expect more than one argument in the script's first line to work reliably. The `-2` in the example might work, but adding another argument could cause the system to treat both arguments as one big argument (spaces and all). This varies from system to system.
:::

### 7.3. Python

Python is a scripting language with a strong following and an array of powerful features.

**Key features:**
- Text processing
- Database access
- Networking
- Multithreading
- Powerful interactive mode
- Well-organized object model

**Executable:** `python` (usually in `/usr/bin`)

**Uses:** Not just command-line scripts—found everywhere from data analysis to web applications.

**Learning resource:** *Python Distilled* by David M. Beazley (Addison-Wesley, 2021)

### 7.4. Perl

One of the older third-party Unix scripting languages is Perl. It's the original "Swiss army chainsaw" of programming tools.

**Strengths:**
- Text processing
- Conversion
- File manipulation

**Status:** Has lost some ground to Python in recent years, but still widely used.

**Learning resources:**
- *Learning Perl, 7th edition* by Schwartz, foy, and Phoenix (O'Reilly, 2016)
- *Modern Perl, 4th edition* by chromatic (Onyx Neon Press, 2016)

### 7.5. Other Scripting Languages

<CardGrid
  title="Additional Scripting Languages"
  cards={[
    {
      title: 'PHP',
      description: 'Hypertext-processing language often found in dynamic web scripts. Some use it for standalone scripts. Website: http://www.php.net/',
      color: colors.blue
    },
    {
      title: 'Ruby',
      description: 'Object-oriented language popular with web developers. Website: http://www.ruby-lang.org/',
      color: colors.red
    },
    {
      title: 'JavaScript (Node.js)',
      description: 'Used in web browsers for dynamic content. Node.js implementation is prevalent in server-side programming. Executable: node',
      color: colors.yellow
    },
    {
      title: 'Emacs Lisp',
      description: 'A variety of the Lisp programming language used by the Emacs text editor',
      color: colors.purple
    },
    {
      title: 'MATLAB / Octave',
      description: 'MATLAB is commercial matrix/mathematical programming language. Octave is a similar free software project.',
      color: colors.orange
    },
    {
      title: 'R',
      description: 'Popular free statistical analysis language. Website: http://www.r-project.org/',
      color: colors.teal
    },
    {
      title: 'Mathematica',
      description: 'Commercial mathematical programming language with extensive libraries',
      color: colors.pink
    },
    {
      title: 'm4',
      description: 'Macro-processing language, usually found only in GNU autotools',
      color: colors.gray
    },
    {
      title: 'Tcl',
      description: 'Tool command language, associated with Tk GUI toolkit and Expect automation. Website: http://www.tcl.tk/',
      color: colors.indigo
    }
  ]}
/>

## 8. Java

Java is a compiled language like C, with simpler syntax and powerful support for object-oriented programming. It has several niches in Unix systems.

### 8.1. Java Overview

**Common uses:**
- Web application environment
- Specialized applications
- Android applications

**Note:** Not often seen on typical Linux desktop, but important to understand.

### 8.2. Two Kinds of Java Compilers

**Native compilers:** Produce machine code for your system (like a C compiler)

**Bytecode compilers:** Produce code for use by a bytecode interpreter (virtual machine)

**On Linux:** You'll practically always encounter bytecode.

:::info Virtual Machine Terminology
The Java "virtual machine" is different from the virtual machine offered by a hypervisor (Chapter 17). It's a bytecode interpreter, not a system virtual machine.
:::

### 8.3. Running Java Bytecode

#### 8.3.1. Java Runtime Environment (JRE)

The JRE contains all programs needed to run Java bytecode.

**Bytecode files:** End in `.class`

**Running a .class file:**

```bash
$ java file.class
```

#### 8.3.2. JAR Files

**What they are:** Collections of archived `.class` files (end in `.jar`)

**Running a .jar file:**

```bash
$ java -jar file.jar
```

### 8.4. Java Environment Variables

Sometimes you need to set Java environment variables:

**JAVA_HOME:** Your Java installation prefix

**CLASSPATH:** Colon-delimited set of directories containing classes your program expects (like PATH for executables)

### 8.5. Compiling Java

To compile `.java` files into bytecode, you need the **Java Development Kit (JDK)**.

**Compiling:**

```bash
$ javac file.java
```

This creates `.class` files.

**JAR utility:** JDK includes `jar`, a program that can create and extract `.jar` files. It works like `tar`.

## 9. Looking Forward: Compiling Packages

The world of compilers and scripting languages is vast and constantly expanding.

### 9.1. New Compiled Languages

As of this writing, new compiled languages are gaining popularity:

**Go (golang):** Popular for application and system programming

**Rust:** Gaining traction in system programming for its safety features

### 9.2. LLVM Compiler Infrastructure

The **LLVM compiler infrastructure** (http://llvm.org/) has significantly eased compiler development.

**Learning resources for compiler development:**
- *Compilers: Principles, Techniques, and Tools, 2nd edition* by Alfred V. Aho et al. (Addison-Wesley, 2006)
- *Modern Compiler Design, 2nd edition* by Dick Grune et al. (Springer, 2012)

### 9.3. Scripting Language Development

For scripting language development, it's usually best to look for online resources, as implementations vary widely.

### 9.4. Next Steps

Now that you know the basics of programming tools on the system, you're ready to see what they can do. The next chapter is all about how you can build packages on Linux from source code.

:::tip Chapter Transition
With the foundation of development tools established, Chapter 16 will guide you through the complete process of compiling and installing software from C source code.
:::
