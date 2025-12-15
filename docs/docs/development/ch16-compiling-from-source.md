---
sidebar_position: 2
title: "Compiling Software from C Source"
description: "Learn to compile, configure, and install C source packages using GNU autoconf and other build systems on Linux"
---

import { ProcessFlow, StackDiagram, CardGrid, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# Compiling Software from C Source Code

Most nonproprietary third-party Unix software packages come as source code that you can build and install. Understanding how to compile from source gives you control over your software and deeper insight into how Linux systems work.

## 1. Why Compile from Source?

### 1.1. Source Code Distribution

**Why source instead of binaries:**

1. **Platform diversity:** Unix and Linux have many different flavors and architectures—it would be difficult to distribute binary packages for all possible platform combinations
2. **Open source community:** Widespread source code distribution encourages users to contribute bug fixes and new features, giving meaning to the term "open source"

**What's available:** You can get nearly everything on a Linux system as source code—from the kernel and C library to web browsers.

### 1.2. Should You Compile Everything from Source?

**Generally, no.** You probably shouldn't update your entire system by installing everything from source code, unless you really enjoy the process or have a specific reason.

**Why distributions are better for core system:**
- Easy ways to update core parts like programs in `/bin`
- Usually fix security problems very quickly
- Automated dependency management

### 1.3. When to Install Packages Yourself

<CardGrid
  title="Reasons to Compile from Source"
  cards={[
    {
      title: 'Control Configuration',
      description: 'Customize build options and features to match your exact needs',
      color: colors.blue
    },
    {
      title: 'Install Anywhere',
      description: 'Choose installation location; install multiple versions of the same package',
      color: colors.green
    },
    {
      title: 'Version Control',
      description: 'Distributions don\'t always stay current, especially for add-ons like Python libraries',
      color: colors.purple
    },
    {
      title: 'Understanding',
      description: 'Better understand how a package works by building it yourself',
      color: colors.orange
    }
  ]}
/>

## 2. Software Build Systems

Many programming environments exist on Linux, from traditional C to interpreted scripting languages. Each typically has at least one distinct system for building and installing packages.

### 2.1. Focus: GNU Autotools

We'll examine compiling and installing C source code using configuration scripts generated from the **GNU autotools suite**.

**Why this system:**
- Generally considered stable
- Many basic Linux utilities use it
- Based on existing tools like `make`
- Knowledge transfers to other build systems

### 2.2. Standard Installation Process

<ProcessFlow
  title="Typical Source Installation Steps"
  steps={[
    {
      label: 'Unpack Archive',
      detail: 'Extract .tar.gz, .tar.bz2, or .tar.xz',
      color: colors.blue
    },
    {
      label: 'Configure',
      detail: 'Run ./configure to detect system',
      color: colors.green
    },
    {
      label: 'Build',
      detail: 'Run make to compile programs',
      color: colors.purple
    },
    {
      label: 'Install',
      detail: 'Run make install to install package',
      color: colors.orange
    }
  ]}
/>

:::info Prerequisites
You should understand the basics in Chapter 15 before proceeding with this chapter.
:::

## 3. Unpacking C Source Packages

A package's source code distribution usually comes as a `.tar.gz`, `.tar.bz2`, or `.tar.xz` file.

### 3.1. Before Unpacking: Verify Contents

Before you unpack, verify the archive contents with `tar tvf` or `tar ztvf`. Some packages don't create their own subdirectories.

#### 3.1.1. Good Archive Structure

Output like this means the package is safe to unpack:

```
package-1.23/Makefile.in
package-1.23/README
package-1.23/main.c
package-1.23/bar.c
--snip--
```

**Why it's good:** All files are in a common directory (`package-1.23`).

#### 3.1.2. Messy Archive Structure

If files aren't in a common directory:

```
Makefile
README
main.c
--snip--
```

**Problem:** Extracting this archive leaves a big mess in your current directory.

**Solution:** Create a new directory and `cd` there before extracting.

#### 3.1.3. Dangerous Archives

Beware of packages with absolute pathnames:

```
/etc/passwd
/etc/inetd.conf
```

:::danger Malicious Archives
If you encounter absolute pathnames, **remove the archive from your system**. It probably contains a Trojan horse or other malicious code.
:::

### 3.2. After Unpacking: Read the Documentation

Once you've extracted the contents, try to get a feel for the package.

**Files to look for:**

<CardGrid
  title="Important Package Files"
  cards={[
    {
      title: 'README',
      description: 'Package description, short manual, installation hints, useful information. ALWAYS READ FIRST.',
      color: colors.blue
    },
    {
      title: 'INSTALL',
      description: 'Compilation and installation instructions, special compiler options, definitions',
      color: colors.green
    },
    {
      title: 'Makefile / configure',
      description: 'Build system files for compiling the software',
      color: colors.purple
    },
    {
      title: '.c / .h / .cc files',
      description: 'C and C++ source code files',
      color: colors.orange
    }
  ]}
/>

### 3.3. File Categories

After unpacking, files roughly fall into three categories:

#### 3.3.1. Build System Files

**Files:** `Makefile`, `Makefile.in`, `configure`, `CMakeLists.txt`

**Old packages:** Come with a Makefile you might need to modify

**Modern packages:** Use a configuration utility like GNU autoconf or CMake with scripts (`configure` or `CMakeLists.txt`) to generate Makefiles from templates (`Makefile.in`) based on your system

#### 3.3.2. Source Code Files

**C files:** `.c` (source), `.h` (headers)
**C++ files:** `.cc`, `.C`, `.cxx` (source)

**Location:** Can appear anywhere in the package directory

#### 3.3.3. Object Files and Binaries

**Files:** `.o` (object files), binaries

**Normally:** Source distributions shouldn't contain these

**Rare exceptions:** Package maintainer not permitted to release certain source code; object files included for linking

**Common issue:** Poorly packaged software with leftover compiled files

**Solution:** Run `make clean` to ensure a fresh compile

## 4. GNU Autoconf

Even though C source code is usually fairly portable, differences on each platform make it impossible to compile most packages with a single Makefile.

### 4.1. Evolution of Build Systems

**Early solutions:**
- Provide individual Makefiles for every operating system
- Provide a Makefile that's easy to modify

**Modern solution:** Scripts that generate Makefiles based on system analysis

### 4.2. How GNU Autoconf Works

GNU autoconf is a popular system for automatic Makefile generation.

**Key files:**
- `configure` - Configuration script
- `Makefile.in` - Makefile template
- `config.h.in` - Configuration header template

**The process:**

1. The `.in` files are templates
2. Run the `configure` script to discover system characteristics
3. `configure` makes substitutions in `.in` files to create real build files

### 4.3. Running Configure

To generate a Makefile from `Makefile.in`:

```bash
$ ./configure
```

**What happens:** You get diagnostic output as the script checks your system for prerequisites.

**On success:** Creates:
- One or more Makefiles
- `config.h` file
- `config.cache` (so it doesn't need to rerun certain tests)

**Next step:** Run `make` to compile the package. A successful configure doesn't guarantee make will work, but chances are good.

<ProcessFlow
  title="Autoconf Build Process"
  steps={[
    {
      label: 'Run ./configure',
      detail: 'Analyzes system, creates Makefile from template',
      color: colors.blue
    },
    {
      label: 'Run make',
      detail: 'Compiles source code using generated Makefile',
      color: colors.green
    },
    {
      label: 'Test (optional)',
      detail: 'Run make check to verify build',
      color: colors.purple
    },
    {
      label: 'Install',
      detail: 'Run make install to install package',
      color: colors.orange
    }
  ]}
/>

:::info Required Build Tools
You must have all required build tools available. Install:
- **Debian/Ubuntu:** `build-essential` package
- **Fedora-like:** "Development Tools" groupinstall
:::

## 5. An Autoconf Example

Let's walk through a complete example using the GNU coreutils package. We'll install it in your home directory to avoid messing up your system.

### 5.1. Getting the Package

Download from: http://ftp.gnu.org/gnu/coreutils/ (get the latest version)

### 5.2. Unpack and Configure

After unpacking and changing to the directory:

```bash
$ ./configure --prefix=$HOME/mycoreutils
checking for a BSD-compatible install... /usr/bin/install -c
checking whether build environment is sane... yes
--snip--
config.status: executing po-directories commands
config.status: creating po/POTFILES
config.status: creating po/Makefile
```

**What --prefix does:** Specifies the installation directory (covered in Section 6.3).

### 5.3. Compile

```bash
$ make
GEN lib/alloca.h
GEN lib/c++defs.h
--snip--
make[2]: Leaving directory '/home/juser/coreutils-8.32/gnulib-tests'
make[1]: Leaving directory '/home/juser/coreutils-8.32'
```

### 5.4. Test the Build

Try running one of the executables you just created:

```bash
$ ./src/ls
```

Run the test suite (this might take a while):

```bash
$ make check
```

### 5.5. Preview Installation

Do a dry run first to see what `make install` will do:

```bash
$ make -n install
```

**Check:** Browse the output. Nothing strange should appear (like installing outside your `mycoreutils` directory).

### 5.6. Install

If the preview looks good, install for real:

```bash
$ make install
```

**Result:** You now have a subdirectory named `mycoreutils` in your home directory containing `bin`, `share`, and other subdirectories.

### 5.7. Explore and Clean Up

**Explore:** Check out the programs in `bin` (you just built many Chapter 2 tools!)

**Clean up:** Because you configured `mycoreutils` as independent, you can remove it completely without worrying about system damage.

## 6. Installation Using a Packaging Tool

On most distributions, you can install new software as a package that you can maintain with your distribution's packaging tools.

### 6.1. Debian-Based Distributions (Ubuntu)

Debian-based distributions are perhaps the easiest. Use the `checkinstall` utility:

```bash
# checkinstall make install
```

**What it does:**
1. Shows settings for the package you're about to build
2. Gives you opportunity to change them
3. Tracks all files to be installed
4. Puts them into a `.deb` file
5. Allows you to use `dpkg` to install and remove the package

### 6.2. RPM-Based Distributions

Creating an RPM package is more involved.

**Process:**
1. Create a directory tree with `rpmdev-setuptree`
2. Use `rpmbuild` utility to work through the steps

**Recommendation:** Follow an online tutorial for this process.

## 7. Configure Script Options

You've seen one of the most useful options for the configure script: using `--prefix` to specify the installation directory.

### 7.1. Default Installation Prefix

**Default prefix:** `/usr/local`

**What this means:**
- Binary programs go in `/usr/local/bin`
- Libraries go in `/usr/local/lib`
- And so on...

**Changing the prefix:**

```bash
$ ./configure --prefix=new_prefix
```

### 7.2. Essential Configure Options

Most versions of configure have a `--help` option that lists configuration options. The list is usually very long, so here are the most important:

<CardGrid
  title="Important Configure Options"
  cards={[
    {
      title: '--bindir=directory',
      description: 'Installs executables in specified directory',
      color: colors.blue
    },
    {
      title: '--sbindir=directory',
      description: 'Installs system executables in specified directory',
      color: colors.green
    },
    {
      title: '--libdir=directory',
      description: 'Installs libraries in specified directory',
      color: colors.purple
    },
    {
      title: '--disable-shared',
      description: 'Prevents building shared libraries (can save hassles later)',
      color: colors.orange
    },
    {
      title: '--with-package=directory',
      description: 'Tells configure that package is in directory. Syntax varies by package.',
      color: colors.red
    }
  ]}
/>

### 7.3. Using Separate Build Directories

You can create separate build directories to experiment with options.

**How it works:**

1. Create a new directory anywhere on the system
2. From that directory, run the configure script in the original package source directory
3. Configure creates a symbolic link farm in your new build directory
4. All links point back to the source tree in the original package directory

**Why it's useful:**
- Original source tree is never modified
- Build for multiple platforms or configurations using the same source package
- Some developers prefer this method

## 8. Environment Variables

You can influence configure with environment variables that become make variables.

### 8.1. Important Environment Variables

**Most important:**
- `CPPFLAGS` - C preprocessor flags
- `CFLAGS` - C compiler flags
- `LDFLAGS` - Linker flags

:::warning Be Careful with Environment Variables
Configure can be very picky about environment variables. For example, use `CPPFLAGS` (not `CFLAGS`) for header file directories, because configure often runs the preprocessor independently of the compiler.
:::

### 8.2. Setting Environment Variables

#### 8.2.1. Method 1: Inline with Configure

In bash, place the variable assignment before `./configure`:

```bash
$ CPPFLAGS=-DDEBUG ./configure
```

#### 8.2.2. Method 2: As Configure Option

Pass the variable as an option to configure:

```bash
$ ./configure CPPFLAGS=-DDEBUG
```

### 8.3. Common Use Cases

#### 8.3.1. Define Preprocessor Macros

Define a DEBUG macro:

```bash
$ CPPFLAGS=-DDEBUG ./configure
```

#### 8.3.2. Add Include Directories

Make the preprocessor search in `include_dir`:

```bash
$ CPPFLAGS=-Iinclude_dir ./configure
```

#### 8.3.3. Add Library Directories

Make the linker look in `lib_dir`:

```bash
$ LDFLAGS=-Llib_dir ./configure
```

#### 8.3.4. Set Runtime Library Path

For shared libraries in `lib_dir`, set the runtime dynamic linker path:

```bash
$ LDFLAGS="-Llib_dir -Wl,-rpath=lib_dir" ./configure
```

### 8.4. Common Mistakes

**Example mistake:** Forgetting the `-` in `-I`:

```bash
$ CPPFLAGS=Iinclude_dir ./configure
```

**Result:**

```
configure: error: C compiler cannot create executables
See 'config.log' for more details
```

**In config.log:**

```
configure:5037: checking whether the C compiler works
configure:5059: gcc Iinclude_dir conftest.c >&5
gcc: error: Iinclude_dir: No such file or directory
configure:5063: $? = 1
configure:5101: result: no
```

<StackDiagram
  title="Environment Variables in Build Process"
  layers={[
    { label: 'Shell Environment', color: colors.blue, items: ['CPPFLAGS, CFLAGS, LDFLAGS'] },
    { label: 'Configure Script', color: colors.green, items: ['Reads environment variables', 'Tests system'] },
    { label: 'Generated Makefile', color: colors.purple, items: ['Contains make variables'] },
    { label: 'Compilation', color: colors.orange, items: ['Compiler uses flags from Makefile'] }
  ]}
/>

## 9. Autoconf Targets

Once you get configure working, the generated Makefile has useful targets beyond the standard `all` and `install`.

<CardGrid
  title="Standard Autoconf Makefile Targets"
  cards={[
    {
      title: 'make clean',
      description: 'Removes all object files, executables, and libraries (as described in Chapter 15)',
      color: colors.blue
    },
    {
      title: 'make distclean',
      description: 'Like make clean but removes all automatically generated files (Makefiles, config.h, config.log). Source tree looks like newly unpacked distribution.',
      color: colors.green
    },
    {
      title: 'make check',
      description: 'Runs battery of tests to verify compiled programs work properly',
      color: colors.purple
    },
    {
      title: 'make install-strip',
      description: 'Like make install but strips symbol table and debugging info from executables/libraries. Stripped binaries require much less space.',
      color: colors.orange
    }
  ]}
/>

## 10. Autoconf Logfiles

If something goes wrong during configure and the cause isn't obvious, examine `config.log` to find the problem.

### 10.1. The Challenge

**Problem:** `config.log` is often a gigantic file, making it difficult to locate the exact source of the issue.

### 10.2. Finding Errors in config.log

**General approach:**
1. Go to the very end of `config.log` (press capital G in `less`)
2. Page back up until you see the problem

**But wait:** There's a lot of stuff at the end (entire environment dump, output variables, cache variables, definitions).

**Better approach:**
1. Go to the end
2. Search backward for a string like "for more details" or text near the end of failed configure output
3. Remember: Use `?` in `less` to initiate reverse search

**Result:** The error will likely be right above what your search finds.

## 11. pkg-config

The multitude of third-party libraries on a system means that keeping all of them in a common location can be messy. Installing each with a separate prefix can lead to build problems.

### 11.1. The Problem

**Example:** Compiling OpenSSH requires the OpenSSL library.

**Questions:**
- Where are the OpenSSL libraries located?
- Which libraries are required?
- What flags do you need to compile and link?

### 11.2. The Solution: pkg-config

Many libraries now use the `pkg-config` program to advertise:
- Locations of include files and libraries
- Exact flags needed to compile and link

### 11.3. Using pkg-config

**Syntax:**

```bash
$ pkg-config options package1 package2 ...
```

#### 11.3.1. Finding Required Libraries

To find libraries required for the zlib compression library:

```bash
$ pkg-config --libs zlib
```

**Output:**

```
-lz
```

#### 11.3.2. Listing All Known Packages

To see all libraries that pkg-config knows about:

```bash
$ pkg-config --list-all
```

This shows each package with a brief description.

### 11.4. How pkg-config Works

pkg-config finds package information by reading configuration files ending with `.pc`.

#### 11.4.1. Example: openssl.pc

Here's `openssl.pc` for the OpenSSL library (Ubuntu system, located in `/usr/lib/x86_64-linux-gnu/pkgconfig`):

```
prefix=/usr
exec_prefix=${prefix}
libdir=${exec_prefix}/lib/x86_64-linux-gnu
includedir=${prefix}/include

Name: OpenSSL
Description: Secure Sockets Layer and cryptography libraries and tools
Version: 1.1.1f
Requires:
Libs: -L${libdir} -lssl -lcrypto
Libs.private: -ldl -lz
Cflags: -I${includedir}
```

#### 11.4.2. Modifying .pc Files

You can change this file. For example, add `-Wl,-rpath=${libdir}` to the library flags to set a runtime library search path.

### 11.5. Where pkg-config Looks for .pc Files

**Default location:** `lib/pkgconfig` directory of pkg-config's installation prefix

**Example:** pkg-config installed with `/usr/local` prefix looks in `/usr/local/lib/pkgconfig`

:::info Development Packages Required
You won't see .pc files for many packages unless you install development packages. For example, to get `openssl.pc` on Ubuntu, you must install the `libssl-dev` package.
:::

### 11.6. Nonstandard .pc File Locations

**Problem:** By default, pkg-config doesn't read .pc files outside its installation prefix. A file like `/opt/openssl/lib/pkgconfig/openssl.pc` will be out of reach.

**Two solutions:**

<CardGrid
  title="Making .pc Files Available"
  cards={[
    {
      title: 'Symbolic Links',
      description: 'Make symbolic links (or copies) from actual .pc files to central pkgconfig directory',
      color: colors.blue
    },
    {
      title: 'PKG_CONFIG_PATH',
      description: 'Set environment variable to include extra pkgconfig directories. Note: Does not work well on systemwide basis.',
      color: colors.orange
    }
  ]}
/>

## 12. Installation Practice

Knowing how to build and install software is good. Knowing **when and where** to install your own packages is even more useful.

### 12.1. Advantages of Self-Installation

<CardGrid
  title="Benefits of Installing Yourself"
  cards={[
    {
      title: 'Customization',
      description: 'Control package defaults and configuration options',
      color: colors.blue
    },
    {
      title: 'Understanding',
      description: 'Get clearer picture of how to use the package when installing it',
      color: colors.green
    },
    {
      title: 'Version Control',
      description: 'You control the release that you run',
      color: colors.purple
    },
    {
      title: 'Easy Backup',
      description: 'Easier to back up a custom package',
      color: colors.orange
    },
    {
      title: 'Network Distribution',
      description: 'Easier to distribute across network (with consistent architecture and isolated installation location)',
      color: colors.teal
    }
  ]}
/>

### 12.2. Disadvantages of Self-Installation

:::warning Consider These Drawbacks

**File conflicts:** If the package is already installed, you might overwrite important files. Use `/usr/local` install prefix to avoid this. Check if distribution has a package available first.

**Time investment:** It takes time to compile and install.

**No automatic updates:** Custom packages don't automatically upgrade. Distributions keep packages up to date without requiring work from you. This is a particular concern for network-facing packages—you want latest security updates.

**Wasted effort:** If you don't use the package, you're wasting time.

**Misconfiguration potential:** Risk of configuring packages incorrectly.
:::

### 12.3. What to Install Yourself

**Not worth it:**
- Packages like coreutils (`ls`, `cat`, etc.) unless building a very custom system

**Worth it:**
- Network servers (like Apache) if you need complete control
- Packages with vital importance to your work
- Latest versions of development libraries not in distribution

## 13. Where to Install

### 13.1. The /usr/local Default

The default prefix in GNU autoconf and many other packages is `/usr/local`, the traditional directory for locally installed software.

**Advantages:**
- Operating system upgrades ignore `/usr/local`
- You won't lose anything during OS upgrade
- Fine for small local software installations

**Problem:** If you have a lot of custom software, this can become a terrible mess. Thousands of odd little files can make their way into the `/usr/local` hierarchy, and you may have no idea where they came from.

### 13.2. Managing Many Packages

**Solution:** If things get unruly, create your own packages as described in Section 6.

**Alternative approaches:**
- Use separate prefixes for each package (e.g., `/opt/package-name`)
- Use a package management system designed for source installations
- Keep detailed records of what you've installed

## 14. Applying a Patch

Most changes to software source code are available as branches of the developer's online repository (such as Git). However, you might occasionally get a **patch** that you need to apply against source code.

### 14.1. What Is a Patch?

**Alternative name:** Also called a **diff** because the `diff` program produces the patch.

**Purpose:** Fix bugs or add features to source code.

### 14.2. Examining a Patch

The beginning of a patch looks like this:

```
--- src/file.c.orig 2015-07-17 14:29:12.000000000 +0100
+++ src/file.c 2015-09-18 10:22:17.000000000 +0100
@@ -2,16 +2,12 @@
```

**What to look for:**
- Patches usually contain alterations to more than one file
- Search for three dashes in a row (`---`) to see altered files
- Always look at the beginning to determine the required working directory

**Example analysis:** This patch refers to `src/file.c`. Therefore, you should change to the directory that **contains** `src` before applying the patch, not to the `src` directory itself.

### 14.3. Applying a Patch

Use the `patch` command:

```bash
$ patch -p0 < patch_file
```

**On success:** `patch` exits without a fuss, leaving you with updated files.

**If prompted:**

```
File to patch:
```

**Meaning:**
- Usually means you're not in the correct directory
- Could indicate your source code doesn't match the patch
- In the latter case, you're probably out of luck—you couldn't properly update the code even if you identified some files

### 14.4. Stripping Path Components

Sometimes patches refer to package versions:

```
--- package-3.42/src/file.c.orig 2015-07-17 14:29:12.000000000 +0100
+++ package-3.42/src/file.c 2015-09-18 10:22:17.000000000 +0100
```

If you have a different version number or renamed directory, tell `patch` to strip leading path components.

**Example:** From the directory containing `src`, to ignore the `package-3.42/` part (strip one leading path component), use `-p1`:

```bash
$ patch -p1 < patch_file
```

## 15. Troubleshooting Compiles and Installations

If you understand the difference between compiler errors, compiler warnings, linker errors, and shared library problems (Chapter 15), you shouldn't have too much trouble fixing glitches when building software.

### 15.1. Reading Make Output

It's important to know the difference between an error and an ignored error.

#### 15.1.1. Real Error

This needs investigation:

```
make: *** [target] Error 1
```

#### 15.1.2. Ignored Error

You can usually disregard this:

```
make: *** [target] Error 1 (ignored)
```

### 15.2. Finding the Real Error

GNU make often calls itself many times in large packages. Each instance is marked with `[N]` where N is a number.

**Example output:**

```
compiler error message involving file.c
make[3]: *** [file.o] Error 1
make[3]: Leaving directory '/home/src/package-5.0/src'
make[2]: *** [all] Error 2
make[2]: Leaving directory '/home/src/package-5.0/src'
make[1]: *** [all-recursive] Error 1
make[1]: Leaving directory '/home/src/package-5.0/'
make: *** [all] Error 2
```

**How to read it:** The first three lines give you the information you need:
- Trouble centers around `file.c`
- Located in `/home/src/package-5.0/src`

**Tip:** Learning to filter out subsequent make errors helps you dig out the real cause.

### 15.3. Specific Errors

#### 15.3.1. Conflicting Types

**Problem:**

```
src.c:22: conflicting types for 'item'
/usr/include/file.h:47: previous declaration of 'item'
```

**Explanation:** Erroneous redeclaration of `item` on line 22 of `src.c`.

**Fix:** Remove the offending line (with a comment, `#ifdef`, or whatever works).

#### 15.3.2. Undeclared Type

**Problem:**

```
src.c:37: 'time_t' undeclared (first use this function)
--snip--
src.c:37: parse error before '...'
```

**Explanation:** Programmer forgot a critical header file.

**How to fix:**

1. Look at the offending line (line 37 in `src.c`):
   ```c
   time_t v1;
   ```

2. Search forward for variable use:
   ```c
   v1 = time(NULL);
   ```

3. Check manual page:
   ```bash
   $ man 2 time
   ```

4. Manual shows required header:
   ```c
   SYNOPSIS
   #include <time.h>

   time_t time(time_t *t);
   ```

5. Add `#include <time.h>` at the beginning of `src.c`

#### 15.3.3. Missing Header File

**Problem:**

```
src.c:4: pkg.h: No such file or directory
(long list of errors follows)
```

**Explanation:** Compiler/preprocessor could not find the `pkg.h` include file.

**Likely causes:**
1. Source code depends on a library you need to install
2. Need to provide nonstandard include path with `-I` (and probably `-L` for linker)

**Distribution-specific help:**

**Debian-based:**
```bash
$ apt-file search pkg.h
```

**RPM-based:**
```bash
$ yum provides */pkg.h
```

**Alternative:** Attempting to compile for an unsupported operating system. Check Makefile and README for platform details.

#### 15.3.4. Missing Program

**Problem:**

```
make: prog: Command not found
```

**Explanation:** You need `prog` on your system to build the package.

**If prog is cc, gcc, or ld:** You don't have development utilities installed.

**If prog is installed:** Alter the Makefile to specify full pathname of `prog`.

**Rare case:** Poorly configured source code builds `prog` and then uses it immediately, assuming current directory (`.`) is in your command path.

**Solutions:**
- Edit Makefile and change `prog` to `./prog`
- Append `.` to your path temporarily

<ProcessFlow
  title="Troubleshooting Compilation Errors"
  steps={[
    {
      label: 'Error Occurs',
      detail: 'Read error message carefully',
      color: colors.red
    },
    {
      label: 'Identify Type',
      detail: 'Compiler, linker, or missing dependency?',
      color: colors.orange
    },
    {
      label: 'Find Root Cause',
      detail: 'Look past make errors to actual problem',
      color: colors.yellow
    },
    {
      label: 'Apply Fix',
      detail: 'Add header, install library, fix path',
      color: colors.green
    },
    {
      label: 'Rebuild',
      detail: 'Run make again to verify fix',
      color: colors.blue
    }
  ]}
/>

## 16. Looking Forward

We've touched only on the basics of building software. After you get the hang of your own builds, try the following:

### 16.1. Learn Other Build Systems

**CMake:** Modern, cross-platform build system generator

**SCons:** Software construction tool using Python

**Meson:** Fast, user-friendly build system

### 16.2. Set Up Builds for Your Software

If you're writing your own software, choose a build system and learn to use it.

**For GNU autoconf packaging:** *Autotools, 2nd edition* by John Calcote (No Starch Press, 2019)

### 16.3. Compile the Linux Kernel

The kernel's build system is completely different from other tools.

**Features:**
- Its own configuration system tailored to customizing kernels and modules
- Straightforward procedure

**Caution:** Always keep your old kernel handy in case you can't boot with a new one. If you understand how the bootloader works, you won't have trouble.

### 16.4. Explore Distribution-Specific Source Packages

Linux distributions maintain their own versions of software source code as special source packages.

**Why explore:**
- Find useful patches that expand functionality
- Find fixes for problems in otherwise unmaintained packages

**Tools:**
- **Debian:** `debuild` for automatic builds
- **RPM-based:** `mock` for automatic builds

### 16.5. The Next Step: Programming

Building software is often a stepping stone to learning about programming and software development.

**What you've learned:**
- The tools you've seen in this chapter and Chapter 15 take the mystery out of where your system software came from
- It's not difficult to take the next steps of looking inside source code, making changes, and creating your own software

:::tip From User to Developer
The skills you've learned here form the foundation for understanding and contributing to open source software. You now know how to build, modify, and even create your own Linux software.
:::
