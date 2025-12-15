---
sidebar_position: 3
title: "Devices"
description: "Understanding Linux device management, device files, sysfs interface, udev system, and how the kernel interacts with hardware through device drivers"
---

import { ProcessFlow, StackDiagram, CardGrid, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# 3. Devices

This chapter is a basic tour of the kernel-provided device infrastructure in a functioning Linux system.

Throughout the history of Linux, there have been many changes to how the kernel presents devices to the user. We'll begin by looking at the traditional system of device files to see how the kernel provides device configuration information through sysfs.

Our goal is to extract information about devices on a system in order to understand a few rudimentary operations.

Later chapters will cover interacting with specific kinds of devices in greater detail.

**What you'll learn:**

- How the kernel interacts with user space for new devices
- The udev system for automatic device configuration
- How the kernel sends messages to user-space processes
- What processes do with device notifications

## 3.1. Device Files

**In plain English:** Device files make hardware look like files. Want to write to a disk? Write to its device file. Want to read from a camera? Read from its device file. This uniform interface makes devices easy to use.

**In technical terms:** The kernel presents many device I/O interfaces to user processes as files. These device files (sometimes called device nodes) allow standard file operations to work with devices. However, file interfaces have limitations, so not all devices or capabilities are accessible through file I/O.

**Why it matters:** Understanding device files helps you work with hardware, troubleshoot problems, and understand how Linux manages devices. Most system interactions with hardware go through device files.

### 3.1.1. Basic Device File Interaction

Linux uses the same design for device files as other Unix flavors.

**Device file location:** `/dev` directory

**Example command:**

```bash
$ echo blah blah > /dev/null
```

**What happens:**

1. Command redirects output to `/dev/null`
2. Kernel bypasses usual file operations
3. Kernel uses device driver for `/dev/null`
4. Driver accepts data and discards it

### 3.1.2. Viewing Device Files

**List devices with permissions:**

```bash
$ ls -l /dev
brw-rw---- 1 root disk 8, 1 Sep 6 08:37 sda1
crw-rw-rw- 1 root root 1, 3 Sep 6 08:37 null
prw-r--r-- 1 root root 0 Mar 3 19:17 fdata
srw-rw-rw- 1 root root 0 Dec 18 07:43 log
```

**File type indicator (first character):**

- `b` - Block device
- `c` - Character device
- `p` - Pipe device
- `s` - Socket device

### 3.1.3. Device Types

<CardGrid
  cards={[
    {
      title: 'Block Device',
      description: 'Fixed-size chunks, random access (disks, partitions)',
      color: colors.blue
    },
    {
      title: 'Character Device',
      description: 'Data streams, sequential access (terminals, printers)',
      color: colors.green
    },
    {
      title: 'Pipe Device',
      description: 'IPC with another process at the other end',
      color: colors.orange
    },
    {
      title: 'Socket Device',
      description: 'Special-purpose interprocess communication',
      color: colors.purple
    }
  ]}
/>

## 3.2. Block Devices

**In plain English:** Block devices are like books divided into numbered pages. You can quickly jump to any page (random access) because each page has a fixed size and location.

**In technical terms:** Programs access data from block devices in fixed chunks. The device's total size is fixed and easy to index. Processes have quick random access to any block with kernel help.

**Why it matters:** Block devices (mainly disks) store your files and data. Understanding how they work helps you manage storage, partition disks, and troubleshoot storage problems.

**Example:** `sda1` (disk partition)

**Characteristics:**

- Easily split into blocks of data
- Total size is fixed
- Blocks can be indexed
- Quick random access to any block
- Used for disks and partitions

**Device numbers:**

```bash
brw-rw---- 1 root disk 8, 1 Sep 6 08:37 sda1
```

- Major number: `8` (device type)
- Minor number: `1` (specific device instance)
- Similar devices share major numbers (e.g., `sda3` and `sdb1`)

## 3.3. Character Devices

**In plain English:** Character devices are like streaming video - data flows in sequence, and you can't rewind or jump ahead. Once data passes through, it's gone.

**In technical terms:** Character devices work with data streams. You can only read characters from or write characters to them. They don't have a fixed size. The kernel usually performs read or write operations immediately and cannot back up and reexamine data.

**Why it matters:** Character devices include terminals, printers, and many other devices. Understanding their limitations helps you work with streaming data and device interactions.

**Example:** `/dev/null`

**Characteristics:**

- Work with data streams
- No fixed size
- Sequential access only
- Kernel can't rewind or reexamine data
- Used for printers, terminals, some devices

> **Insight**
>
> During character device interaction, the kernel cannot back up and reexamine the data stream after it has passed data to a device or process. This is a fundamental difference from block devices.

## 3.4. Pipe Devices

**In plain English:** Pipes are like character devices, but instead of hardware at the other end, there's another program. Think of them as tubes connecting two programs.

**In technical terms:** Named pipes are like character devices with another process at the other end of the I/O stream instead of a kernel driver. They enable interprocess communication (IPC).

**Why it matters:** Named pipes enable sophisticated communication between programs without network overhead or shared files.

**Example:** `fdata`

**Characteristics:**

- Similar to character devices
- Another process at the other end
- Enable interprocess communication
- Found in `/dev` or elsewhere

## 3.5. Socket Devices

**In plain English:** Sockets are like telephone lines between programs - they enable two-way communication, often between programs on different machines or the same machine.

**In technical terms:** Sockets are special-purpose interfaces frequently used for interprocess communication. Socket files represent Unix domain sockets, which provide IPC on the same machine.

**Why it matters:** Sockets are fundamental to network communication and local IPC. Most network services use sockets.

**Example:** `log`

**Characteristics:**

- Special-purpose interfaces
- Frequently used for IPC
- Often found outside `/dev` directory
- Represent Unix domain sockets

> **Insight**
>
> You'll learn more about sockets and their uses in Chapter 10, which covers networking and interprocess communication.

## 3.6. Device Numbers

**In plain English:** Device numbers are like addresses - the major number indicates the neighborhood (device type), and the minor number indicates the specific house (device instance).

**In technical terms:** The major and minor device numbers identify devices to the kernel. The major number typically identifies the driver or device class, and the minor number identifies a specific device instance.

**Why it matters:** Understanding device numbers helps you identify device relationships and troubleshoot device issues.

**Reading device numbers:**

```bash
brw-rw---- 1 root disk 8, 1 Sep 6 08:37 sda1
crw-rw-rw- 1 root root 1, 3 Sep 6 08:37 null
```

- `sda1`: Major 8, Minor 1
- `null`: Major 1, Minor 3

**Similar devices:**

Devices performing similar functions often share major numbers:

- `sda3` and `sdb1` both use major number 8 (SCSI/SATA disks)

> **Warning**
>
> Not all devices have device files. Network interfaces don't have device files because the block and character device I/O interfaces aren't appropriate. The kernel offers other I/O interfaces for such devices.

## 3.7. The sysfs Device Path

**In plain English:** While `/dev` is convenient, it doesn't tell you much about devices. The sysfs interface (`/sys`) provides detailed information about device hardware attributes, connections, and capabilities.

**In technical terms:** The sysfs interface provides a uniform view of attached devices based on their actual hardware attributes through a system of files and directories. The base path is `/sys/devices`.

**Why it matters:** Sysfs gives you detailed device information for troubleshooting, understanding hardware topology, and device management. It's essential for modern Linux device management.

### 3.7.1. Device Path Example

**Traditional device file:**

```
/dev/sda
```

**Corresponding sysfs path:**

```
/sys/devices/pci0000:00/0000:00:17.0/ata3/host0/target0:0:0/0:0:0:0/block/sda
```

**Path comparison:**

- `/dev/sda` - For user processes to use the device
- `/sys/devices/...` - For viewing information and managing the device

### 3.7.2. Sysfs Path Contents

**Listing a device path:**

```bash
$ ls /sys/devices/.../block/sda
alignment_offset  discard_alignment  holders      removable  size     uevent
bdi              events            inflight     ro         slaves
capability       events_async      power        sda1       stat
dev              events_poll_msecs queue        sda2       subsystem
device           ext_range         range        sda5       trace
```

**Understanding the files:**

Files and subdirectories are meant for programs, but you can examine them to understand device attributes.

**Example - dev file:**

```bash
$ cat /sys/devices/.../block/sda/dev
8:0
```

Shows major and minor device numbers (matching `/dev/sda`).

### 3.7.3. Sysfs Shortcuts

**The /sys/block directory:**

```bash
$ ls -l /sys/block
```

Shows symbolic links to all block devices on the system.

**Revealing true paths:**

```bash
$ ls -l /sys/block
lrwxrwxrwx 1 root root 0 Sep 6 08:37 sda -> ../devices/pci0000:00/0000:00:17.0/ata3/host0/target0:0:0/0:0:0:0/block/sda
```

The links point to actual sysfs paths.

### 3.7.4. Finding Sysfs Locations

**In plain English:** It can be difficult to find the sysfs location of a device from its `/dev` filename. The `udevadm` command solves this by showing you the path and other attributes.

**Using udevadm:**

```bash
$ udevadm info --query=all --name=/dev/sda
```

Shows the sysfs path and many other interesting attributes.

> **Insight**
>
> You'll find more details about `udevadm` and the entire udev system in Section 3.5, where we explore how the system automatically configures devices.

## 3.8. dd and Devices

**In plain English:** The `dd` command is like a precision data copier. It can copy exact chunks of data from anywhere to anywhere, which is powerful but dangerous. One wrong command can destroy your data.

**In technical terms:** `dd` reads from an input file or stream and writes to an output file or stream, possibly doing encoding conversion. It can process chunks of data in the middle of a file, ignoring surrounding data, making it useful for block and character devices.

**Why it matters:** `dd` is essential for low-level disk operations, creating disk images, wiping drives, and working directly with block devices. But it's also easy to destroy data with careless use.

> **Warning**
>
> `dd` is extremely powerful, so make sure you know what you're doing. It's very easy to corrupt files and data on devices by making a careless mistake. When unsure, write output to a new file first.

### 3.8.1. Basic dd Usage

**Example command:**

```bash
$ dd if=/dev/zero of=new_file bs=1024 count=1
```

**What it does:**

- Copies one 1,024-byte block from `/dev/zero`
- Writes to `new_file`
- `/dev/zero` provides a continuous stream of zero bytes

### 3.8.2. dd Option Format

**In plain English:** Unlike most Unix commands that use dashes for options (like `ls -l`), `dd` uses an old IBM-style format where you set options with equals signs.

**Format:** `option=value`

**Example:** `bs=1024` (not `-bs 1024` or `--block-size 1024`)

### 3.8.3. Important dd Options

<CardGrid
  cards={[
    {
      title: 'if=file',
      description: 'Input file (default: stdin)',
      color: colors.blue
    },
    {
      title: 'of=file',
      description: 'Output file (default: stdout)',
      color: colors.green
    },
    {
      title: 'bs=size',
      description: 'Block size for both input and output',
      color: colors.orange
    },
    {
      title: 'count=num',
      description: 'Total number of blocks to copy',
      color: colors.purple
    },
    {
      title: 'skip=num',
      description: 'Skip first num blocks in input',
      color: colors.blue
    }
  ]}
/>

**Option details:**

**if=file** (input file)

- Specifies input file
- Default: standard input

**of=file** (output file)

- Specifies output file
- Default: standard output

**bs=size** (block size)

- Bytes to read and write at once
- Can use abbreviations: `b` (512), `k` (1024)
- Example: `bs=1k` is same as `bs=1024`

**ibs=size, obs=size** (separate input/output block sizes)

- Use when input and output need different block sizes
- Otherwise use `bs` for both

**count=num** (block count)

- Total blocks to copy
- Essential when working with huge files or endless streams
- Prevents wasting disk space or CPU time
- Use with `skip` to copy small pieces from large files

**skip=num** (skip blocks)

- Skip first `num` blocks in input
- Don't copy skipped blocks to output
- Useful for extracting data from middle of files

### 3.8.4. Practical dd Examples

**Copy partial disk:**

```bash
$ dd if=/dev/sda of=disk_image.img bs=1M count=100 skip=0
```

Copies first 100 MB of `/dev/sda`.

**Create file of zeros:**

```bash
$ dd if=/dev/zero of=zeros.dat bs=1k count=10
```

Creates a 10 KB file of zeros.

**Extract data from middle of file:**

```bash
$ dd if=largefile.bin of=chunk.bin bs=1M skip=50 count=1
```

Extracts 1 MB starting at 50 MB offset.

> **Warning**
>
> Always double-check `dd` commands before running them, especially when `of=` points to a device. One typo can overwrite your entire disk!

## 3.9. Device Name Summary

**In plain English:** Finding the right device name can be tricky when working with hardware. Multiple methods exist, with udevadm being the most reliable for modern systems.

**Why it matters:** Knowing how to find device names is essential for partitioning disks, mounting filesystems, and troubleshooting hardware problems.

### 3.9.1. Methods to Find Device Names

**1. Query udevd using udevadm (most reliable):**

```bash
$ udevadm info --query=all --name=/dev/sda
```

**2. Look in /sys directory:**

```bash
$ ls -l /sys/block
```

**3. Check kernel messages:**

```bash
$ journalctl -k
```

or examine kernel system log (Section 7.1)

**4. Check mount command output (for visible disks):**

```bash
$ mount
```

**5. View current device drivers:**

```bash
$ cat /proc/devices
```

Shows block and character devices with drivers loaded.

> **Insight**
>
> Among these methods, only udevadm is truly reliable. If udev is unavailable, try other methods but remember the kernel might not have a device file for your hardware.

## 3.10. Common Linux Devices

**In plain English:** Different types of hardware show up as different device names in Linux. Knowing the naming conventions helps you identify devices and understand your system's hardware.

**Why it matters:** Understanding device naming helps you work with disks, configure systems, and troubleshoot hardware issues.

### 3.10.1. Hard Disks: /dev/sd*

**In plain English:** Most modern hard disks and SSDs appear as `/dev/sda`, `/dev/sdb`, etc. The "sd" stands for SCSI disk, even though most drives aren't actually SCSI - they just use SCSI commands.

**Device names:**

- `/dev/sda` - First entire disk
- `/dev/sdb` - Second entire disk
- `/dev/sda1` - First partition on first disk
- `/dev/sda2` - Second partition on first disk

**Why "sd" (SCSI disk)?**

- SCSI was originally a hardware standard
- SCSI protocol is now used everywhere
- USB storage devices use SCSI commands
- SATA disks use SCSI commands
- So all appear as "sd" devices

**Viewing SCSI devices:**

```bash
$ lsscsi
[0:0:0:0] disk    ATA WDC WD3200AAJS-2 01.0 /dev/sda
[2:0:0:0] disk    FLASH Drive UT_USB20 0.00 /dev/sdb
```

**Output columns:**

1. `[0:0:0:0]` - Device address on system
2. `disk` - Device type
3. Vendor information
4. `/dev/sda` - Device file location

**Device assignment:**

Linux assigns devices in the order drivers encounter them:

- Kernel finds disk first → `/dev/sda`
- Finds flash drive second → `/dev/sdb`

### 3.10.2. The Device Assignment Problem

**In plain English:** If a disk fails and you remove it, other disks shift names (like `/dev/sdc` becoming `/dev/sdb`). This causes problems if you've hard-coded device names in configuration files.

**Problem scenario:**

1. System has three disks: `/dev/sda`, `/dev/sdb`, `/dev/sdc`
2. `/dev/sdb` fails and you remove it
3. Former `/dev/sdc` becomes `/dev/sdb`
4. No longer a `/dev/sdc`
5. Configuration files referencing old names break

**Solutions:**

- **UUID (Universally Unique Identifier):** Stable disk identification (Section 4.2.4)
- **LVM (Logical Volume Manager):** Stable disk device mapping
- **Device labels:** User-assigned persistent names

> **Insight**
>
> Many Linux systems use UUIDs and/or LVM to avoid problems with changing device names. This makes disk management much more reliable.

### 3.10.3. Virtual Disks: /dev/xvd*, /dev/vd*

**Purpose:** Optimized for virtual machines (AWS, VirtualBox, etc.)

**Naming:**

- `/dev/xvd*` - Xen virtualization system
- `/dev/vd*` - Similar type for other VMs

### 3.10.4. Non-Volatile Memory Devices: /dev/nvme*

**In plain English:** Modern fast SSDs use a new interface called NVMe that's optimized for solid-state storage. These show up as `/dev/nvme*` devices.

**Purpose:** NVMe (Non-Volatile Memory Express) interface for SSDs

**Listing NVMe devices:**

```bash
$ nvme list
```

### 3.10.5. Device Mapper: /dev/dm-*, /dev/mapper/*

**Purpose:** Logical Volume Manager (LVM) uses device mapper

**Device names:**

- `/dev/dm-0`, `/dev/dm-1`, etc. - Block devices
- `/dev/mapper/*` - Symbolic links to dm devices

> **Insight**
>
> If you see devices starting with `/dev/dm-` and links in `/dev/mapper`, your system uses LVM. You'll learn all about this in Chapter 4.

### 3.10.6. CD and DVD Drives: /dev/sr*

**Purpose:** Optical storage drives

**Device names:**

- `/dev/sr0`, `/dev/sr1`, etc. - Read-only access
- `/dev/sg0`, etc. - "Generic" SCSI devices for writing

**Note:** Older interfaces might show as `/dev/hd*` (PATA devices)

### 3.10.7. PATA Hard Disks: /dev/hd*

**In plain English:** These are older disk devices that use a different interface than modern SATA. You'll mainly see them on older hardware or in compatibility modes.

**Device names:**

- `/dev/hda`, `/dev/hdb`, `/dev/hdc`, `/dev/hdd`

**Characteristics:**

- PATA (Parallel ATA) is an older storage bus
- Common on older Linux kernels and hardware
- Fixed assignments based on interface positions

**Compatibility mode issue:**

If a SATA drive appears as `/dev/hd*`:
- Running in compatibility mode
- Hinders performance
- Check BIOS settings to switch to native SATA mode

### 3.10.8. Terminals: /dev/tty*, /dev/pts/*, /dev/tty

**In plain English:** Terminals are the interfaces where you type commands and see output. Most are "pseudoterminals" - software emulations of old physical terminals.

**In technical terms:** Terminals are devices for moving characters between a user process and an I/O device, usually for text output to a screen. The terminal device interface dates back to typewriter-based terminals.

**Why it matters:** Understanding terminal devices helps you work with multiple login sessions, understand process relationships, and troubleshoot terminal issues.

**Common terminal devices:**

- `/dev/tty1` - First virtual console
- `/dev/pts/0` - First pseudoterminal device
- `/dev/tty` - Controlling terminal of current process

**Pseudoterminal characteristics:**

- Emulated terminals (software, not hardware)
- Understand I/O features of real terminals
- Kernel presents I/O interface to software
- Used by terminal windows you type into

**The /dev/tty device:**

- Special device
- Synonym for current process's controlling terminal
- Only accessible if process is attached to a terminal

### 3.10.9. Display Modes and Virtual Consoles

**In plain English:** Linux can run in text mode (like old DOS) or graphics mode. Virtual consoles let you switch between multiple independent terminal sessions, like having multiple computers in one.

**Two primary display modes:**

1. **Text mode** - Character-based display
2. **Graphics mode** - Windowing systems (Chapter 14)

**Modern boot behavior:**

- Most distributions hide text mode during boot
- Use kernel parameters and bootsplash (plymouth)
- Switch to full graphics mode near end of boot

**Virtual consoles:**

Linux multiplexes the display with virtual consoles:

- Each can run in text or graphics mode
- Switch between them with key combinations

**Text mode switching:**

- `Alt-F1` - Switch to `/dev/tty1`
- `Alt-F2` - Switch to `/dev/tty2`
- And so on...

**Graphics mode switching:**

- Graphics takes over a free virtual console
- If getty on tty1 and tty2, graphics uses tty3
- Use `Ctrl-Alt-F1` to switch to text console
- Use `Alt-F2`, `Alt-F3`, etc. to return to graphics

> **Insight**
>
> If you want to see your text console after system boots, press `Ctrl-Alt-F1`. To return to the graphical environment, press `Alt-F2`, `Alt-F3`, and so on until you reach it.

**Forcing console switches:**

If switching fails (input malfunction, etc.):

```bash
# chvt 1
```

Switches to tty1 as root.

> **Warning**
>
> Some distributions use tty1 in graphics mode. In this case, you'll need to try other consoles (tty2, tty3, etc.) to find text mode.

### 3.10.10. Serial Ports: /dev/ttyS*, /dev/ttyUSB*, /dev/ttyACM*

**In plain English:** Serial ports are old-style connection ports. While less common now, they're still used for some hardware, embedded systems, and development boards.

**Device names:**

- `/dev/ttyS0` - COM1 (Windows equivalent)
- `/dev/ttyS1` - COM2
- `/dev/ttyUSB0` - USB serial adapter
- `/dev/ttyACM0` - USB modem/serial device

**Characteristics:**

- True terminal devices
- Require configuration (baud rate, flow control)
- Not much direct command-line use

**Using serial ports:**

```bash
$ screen /dev/ttyACM0
```

Connects to serial terminal.

**Permission requirements:**

- Need read/write permission to device
- Often requires membership in special group (e.g., `dialout`)

**Modern applications:**

- Microcontroller development boards
- CircuitPython boards with USB serial
- Plug in, find device (usually `/dev/ttyACM0`)
- Connect with `screen` or similar tool

### 3.10.11. Parallel Ports: /dev/lp0, /dev/lp1

**In plain English:** Parallel ports are old printer connections largely replaced by USB and networks. You'll rarely use them on modern systems.

**Device names:**

- `/dev/lp0` - LPT1: (Windows)
- `/dev/lp1` - LPT2:

**Characteristics:**

- Unidirectional (outgoing only)
- Largely replaced by USB and networks

**Bidirectional ports:**

- `/dev/parport0`
- `/dev/parport1`

**Usage:**

```bash
$ cat file.txt > /dev/lp0
```

Sends file directly to printer (may need form feed after).

> **Insight**
>
> A print server like CUPS is much better at handling printer interaction than directly writing to parallel ports.

### 3.10.12. Audio Devices: /dev/snd/*, /dev/dsp, /dev/audio

**In plain English:** Linux audio is complicated with multiple layers. Modern systems use ALSA for audio, but working directly with audio devices is difficult and usually unnecessary.

**Two sets of audio devices:**

1. **ALSA (Advanced Linux Sound Architecture)** - Modern system
   - Devices in `/dev/snd`
   - Difficult to work with directly

2. **OSS (Open Sound System)** - Older system
   - Backward compatibility devices
   - `/dev/dsp`, `/dev/audio`
   - Only available if OSS kernel support loaded

**Rudimentary OSS operations:**

```bash
$ cat sound.wav > /dev/dsp
```

Plays WAV file (maybe - depends on hardware compatibility).

**Challenges:**

- Device often busy (sound server running)
- Frequency mismatches common
- Multiple layers involved

**Audio architecture:**

- Kernel-level devices (ALSA/OSS)
- User-space servers (pulseaudio, etc.)
- Servers manage audio from different sources
- Act as intermediaries between devices and processes

> **Warning**
>
> Linux sound is a messy subject due to many layers involved. Direct device access is usually not the right approach. Use higher-level audio libraries and servers instead.

## 3.11. Device File Creation

**In plain English:** On modern Linux systems, you never need to create device files manually - the system does it automatically. But understanding how it works helps you troubleshoot and understand the system.

**In technical terms:** Device files are created automatically by devtmpfs and udev. However, understanding the `mknod` command and the evolution of device file management provides insight into how the system works.

**Why it matters:** Understanding device file creation helps you troubleshoot device issues and understand system initialization.

### 3.11.1. Using mknod

**Purpose:** Creates device files manually (rarely needed)

**Requirements:**

- Device name
- Device type
- Major number
- Minor number

**Example:**

```bash
# mknod /dev/sda1 b 8 1
```

**Arguments:**

- `/dev/sda1` - Device file name
- `b` - Block device (`c` for character, `p` for pipe)
- `8` - Major number
- `1` - Minor number

**Creating named pipes:**

```bash
# mknod /tmp/mypipe p
```

Omit major/minor numbers for pipes.

### 3.11.2. Historical Device File Management

**In plain English:** In the old days, creating and maintaining device files was a manual chore that got more complex with each kernel upgrade. The system evolved through several solutions before arriving at the current udev/devtmpfs approach.

**Old static system:**

- `/dev` directory maintained manually
- Each system had a `MAKEDEV` program
- Created groups of device files
- When upgrading, run new `MAKEDEV`
- Became ungainly with frequent kernel updates

**devfs (first attempt):**

- Kernel-space implementation of `/dev`
- Contained all devices kernel supported
- Had numerous limitations
- Led to development of udev and devtmpfs

**Modern approach: udev + devtmpfs**

- Kernel creates device files as needed (devtmpfs)
- User-space daemon handles initialization (udev)
- Combines best of both approaches
- Reliable and flexible

> **Insight**
>
> The evolution from static device files to devfs to udev/devtmpfs shows how Linux continuously improves. Each solution addressed limitations of its predecessor while maintaining compatibility.

## 3.12. udev

**In plain English:** udev is like a reception desk for new hardware. When you plug in a device, the kernel tells udev "we have a visitor!" Then udev creates device files, sets up permissions, notifies programs, and makes the device ready to use.

**In technical terms:** udev is a user-space system for managing device files. The kernel's devtmpfs creates basic device files, then notifies the udevd daemon. udevd performs device initialization, sets permissions, creates symbolic links, and notifies other processes.

**Why it matters:** udev makes device management automatic and flexible. Understanding it helps you troubleshoot device problems, customize device behavior, and understand how Linux handles hardware.

### 3.12.1. Why udev?

**Problem with kernel-only device management:**

- Unnecessary complexity in the kernel is dangerous
- Device file creation possible in user space
- Why do it in kernel?

**The solution:**

- Kernel detects new device (e.g., USB flash drive)
- Kernel sends notification to user-space process (udevd)
- udevd examines device characteristics
- udevd creates device file
- udevd performs device initialization

> **Insight**
>
> You'll almost certainly see udevd running as `systemd-udevd` because it's part of the systemd initialization system (Chapter 6).

### 3.12.2. The Boot-Time Challenge

**The problem:**

- Device files necessary early in boot procedure
- udevd must start very early
- To create device files, udevd can't depend on devices it should create
- Must start quickly so rest of system doesn't wait

**The dilemma:**

- Need devices to start udevd
- Need udevd to create devices
- Circular dependency!

### 3.12.3. devtmpfs

**In plain English:** devtmpfs solves the boot-time chicken-and-egg problem. The kernel creates basic device files immediately, while udev handles the fancy stuff (permissions, links, notifications) afterward.

**In technical terms:** devtmpfs is a filesystem where the kernel creates device files as necessary during device discovery. It notifies udevd that a device is available. udevd doesn't create device files but performs initialization, sets permissions, and notifies other processes.

**Why it matters:** devtmpfs makes boot faster and more reliable by ensuring devices are available immediately while still allowing flexible user-space configuration.

**How it works:**

1. Kernel creates device files in devtmpfs
2. Kernel notifies udevd of new device
3. udevd performs initialization
4. udevd sets permissions
5. udevd creates symbolic links (like in `/dev/disk/by-id`)
6. udevd notifies other processes

### 3.12.4. Persistent Device Naming

**Example: Links for a disk and partitions**

```bash
$ ls -l /dev/disk/by-id
lrwxrwxrwx 1 root root 9 Jul 26 10:23 scsi-SATA_WDC_WD3200AAJS-_WD-WMAV2FU80671 -> ../../sda
lrwxrwxrwx 1 root root 10 Jul 26 10:23 scsi-SATA_WDC_WD3200AAJS-_WD-WMAV2FU80671-part1 -> ../../sda1
lrwxrwxrwx 1 root root 10 Jul 26 10:23 scsi-SATA_WDC_WD3200AAJS-_WD-WMAV2FU80671-part2 -> ../../sda2
```

**Link naming:**

- Interface type
- Manufacturer and model information
- Serial number
- Partition (if applicable)

**How udevd creates these:**

- Examines device attributes
- Follows rules in configuration files
- Creates appropriate symbolic links
- Stores links in devtmpfs (in-memory filesystem)

> **Insight>
>
> The "tmp" in devtmpfs indicates the filesystem resides in main memory with read/write capability by user-space processes. This enables udevd to create symbolic links and other modifications.

## 3.13. udevd Operation and Configuration

**In plain English:** When hardware appears, the kernel sends udevd a message (uevent) describing the device. udevd reads its rulebook to decide what to do - create links, set permissions, run programs, etc.

**In technical terms:** udevd receives uevents from the kernel via an internal network link, loads event attributes, parses rules, filters and updates the uevent based on rules, and takes actions or sets attributes accordingly.

**Why it matters:** Understanding udev rules helps you customize device behavior, troubleshoot device issues, and understand how devices are configured.

<ProcessFlow
  title="udevd Device Processing"
  steps={[
    {
      label: 'Kernel Detects Device',
      description: 'Hardware change triggers kernel',
      color: colors.blue
    },
    {
      label: 'Send uevent',
      description: 'Kernel sends notification via netlink',
      color: colors.green
    },
    {
      label: 'Load Attributes',
      description: 'udevd loads uevent properties',
      color: colors.orange
    },
    {
      label: 'Parse Rules',
      description: 'udevd reads configuration rules',
      color: colors.purple
    },
    {
      label: 'Filter & Update',
      description: 'Apply rules to modify uevent',
      color: colors.blue
    },
    {
      label: 'Take Actions',
      description: 'Create links, set permissions, run programs',
      color: colors.green
    }
  ]}
/>

### 3.13.1. uevent Example

**Incoming uevent from kernel:**

```
ACTION=change
DEVNAME=sde
DEVPATH=/devices/pci0000:00/0000:00:1a.0/usb1/1-1/1-1.2/1-1.2:1.0/host4/target4:0:0/4:0:0:3/block/sde
DEVTYPE=disk
DISK_MEDIA_CHANGE=1
MAJOR=8
MINOR=64
SEQNUM=2752
SUBSYSTEM=block
UDEV_LOG=3
```

**uevent contents:**

- Device name
- sysfs device path
- Various attributes and properties
- Everything udevd needs to process the device

### 3.13.2. Rules Files

**Rule file locations:**

- `/lib/udev/rules.d` - Default rules
- `/etc/udev/rules.d` - Override rules

**How udevd reads rules:**

1. Reads rules from start to finish of each file
2. After processing a rule, continues reading for more applicable rules
3. Uses directives (like GOTO) to skip sections if needed
4. Skip directives often at top to bypass irrelevant rules

### 3.13.3. Example Rules for Disk Devices

**From /lib/udev/rules.d/60-persistent-storage.rules:**

```
# ATA
KERNEL=="sd*[!0-9]|sr*", ENV{ID_SERIAL}!="?*", SUBSYSTEMS=="scsi", \
  ATTRS{vendor}=="ATA", IMPORT{program}="ata_id --export $devnode"

# ATAPI devices (SPC-3 or later)
KERNEL=="sd*[!0-9]|sr*", ENV{ID_SERIAL}!="?*", SUBSYSTEMS=="scsi", \
  ATTRS{type}=="5", ATTRS{scsi_level}=="[6-9]*", \
  IMPORT{program}="ata_id --export $devnode"
```

**Rule components:**

**Conditionals:**

- `KERNEL=="sd*[!0-9]|sr*"` - Match device names
- `SUBSYSTEMS=="scsi"` - Match subsystem
- `ATTRS{vendor}=="ATA"` - Match attributes
- All must be true for rule to apply

**Directives:**

- `IMPORT{program}="ata_id --export $devnode"` - Execute program
- Not conditional, executes if previous conditionals true
- Sets environment variables for subsequent rules

### 3.13.4. Understanding Rule Syntax

**Conditionals vs. Directives:**

**Conditionals (matching):**
- Use `==` (equal) or `!=` (not equal)
- Must be true for rule to apply

**Directives (actions):**
- Use `=` (assign), `+=` (append), or `:=` (assign final)
- Execute if conditionals match

**Example directive:**

```
SYMLINK+="disk/by-id/$env{ID_BUS}-$env{ID_SERIAL}"
```

Adds a symbolic link for the device.

### 3.13.5. Complete Rule Example

**Rule to create device links:**

```
KERNEL=="sd*|sr*|cciss*", ENV{DEVTYPE}=="disk", ENV{ID_SERIAL}=="?*", \
  SYMLINK+="disk/by-id/$env{ID_BUS}-$env{ID_SERIAL}"
```

**Breakdown:**

1. Match SCSI disks (`sd*`) or optical (`sr*`) or RAID (`cciss*`)
2. Must be a disk device type
3. Must have `ID_SERIAL` set (from earlier rules)
4. If all true, create symbolic link in `/dev/disk/by-id/`

**Link name components:**

- `$env{ID_BUS}` - Bus type (e.g., "scsi", "ata")
- `$env{ID_SERIAL}` - Serial number

**Result:**

```
/dev/disk/by-id/scsi-SATA_WDC_WD3200AAJS-_WD-WMAV2FU80671 -> ../../sda
```

> **Insight**
>
> Earlier rules set `ID_SERIAL`. This rule requires it to be set (`ID_SERIAL}=="?*"`). This pattern ensures rules execute in the right order and variables are available when needed.

## 3.14. udevadm

**In plain English:** udevadm is like a Swiss Army knife for working with devices. You can see device information, monitor hardware events, and even trigger fake events for testing.

**In technical terms:** udevadm is an administration tool for udevd. It can reload rules, trigger events, search for system devices, explore device attributes, and monitor uevents in real-time.

**Why it matters:** udevadm is essential for troubleshooting device problems, understanding device attributes, and monitoring hardware changes.

### 3.14.1. Exploring Device Information

**View all device attributes:**

```bash
$ udevadm info --query=all --name=/dev/sda
```

**Example output:**

```
P: /devices/pci0000:00/0000:00:1f.2/host0/target0:0:0/0:0:0:0/block/sda
N: sda
S: disk/by-id/ata-WDC_WD3200AAJS-22L7A0_WD-WMAV2FU80671
S: disk/by-id/scsi-SATA_WDC_WD3200AAJS-_WD-WMAV2FU80671
S: disk/by-id/wwn-0x50014ee057faef84
S: disk/by-path/pci-0000:00:1f.2-scsi-0:0:0:0
E: DEVLINKS=/dev/disk/by-id/ata-WDC_WD3200AAJS-22L7A0_WD-WMAV2FU80671 ...
E: DEVNAME=/dev/sda
E: DEVPATH=/devices/pci0000:00/0000:00:1f.2/host0/target0:0:0/0:0:0:0/block/sda
E: DEVTYPE=disk
E: ID_ATA=1
--snip--
```

**Output prefix meanings:**

- `P:` - sysfs device path
- `N:` - Device node (device file name)
- `S:` - Symbolic link to device
- `E:` - Additional device information (from udev rules)

### 3.14.2. Device Monitoring

**In plain English:** Device monitoring lets you watch hardware events in real-time, like seeing messages when you plug in a USB drive or when network interfaces change state.

**Start monitoring:**

```bash
$ udevadm monitor
```

**Example output (inserting flash media):**

```
KERNEL[658299.569485] add /devices/pci0000:00/0000:00:1d.0/usb2/2-1/2-1.2 (usb)
KERNEL[658299.569667] add /devices/pci0000:00/0000:00:1d.0/usb2/2-1/2-1.2/2-1.2:1.0 (usb)
KERNEL[658299.570614] add /devices/.../host15 (scsi)
KERNEL[658299.570645] add /devices/.../host15/scsi_host/host15 (scsi_host)
UDEV [658299.622579] add /devices/pci0000:00/0000:00:1d.0/usb2/2-1/2-1.2 (usb)
UDEV [658299.623014] add /devices/pci0000:00/0000:00:1d.0/usb2/2-1/2-1.2/2-1.2:1.0 (usb)
UDEV [658299.623673] add /devices/.../host15 (scsi)
UDEV [658299.623690] add /devices/.../host15/scsi_host/host15 (scsi_host)
```

**Understanding output:**

- `KERNEL` - Events from kernel
- `UDEV` - Events after udevd processing
- Two copies of each message (kernel + udevd)

### 3.14.3. Monitor Options

**Show only kernel events:**

```bash
$ udevadm monitor --kernel
```

**Show only udevd events:**

```bash
$ udevadm monitor --udev
```

**Show full uevent properties:**

```bash
$ udevadm monitor --property
```

**Combine options:**

```bash
$ udevadm monitor --udev --property
```

Shows uevents after udevd processing with all properties.

**Filter by subsystem:**

```bash
$ udevadm monitor --kernel --subsystem-match=scsi
```

Shows only SCSI subsystem events from kernel.

> **Insight**
>
> There's much more to udev. For example, `udisksd` is a daemon that listens for events to automatically attach disks and notify other processes about new disks.

## 3.15. In-Depth: SCSI and the Linux Kernel

**In plain English:** This section dives deep into how the Linux kernel handles SCSI and related storage devices. It's advanced material that shows kernel architecture, but you don't need it to use disks.

**In technical terms:** This section explores the SCSI subsystem in the Linux kernel as a case study of kernel architecture. It covers the three-layer SCSI driver structure, USB storage integration, SATA/ATA handling via libata, and generic SCSI devices.

**Why it matters:** Understanding the SCSI subsystem provides insight into kernel design, device driver organization, and how different hardware interfaces work together. However, this is optional advanced material.

> **Warning**
>
> This section is more advanced and theoretical than previous material. If you're eager to start using disks or prefer hands-on learning, skip to Chapter 4. You can return to this section later when you're curious about kernel architecture.

### 3.15.1. SCSI Background

**Traditional SCSI hardware:**

- Host adapter linked to chain of devices over SCSI bus
- Host adapter attached to computer
- Each device has an SCSI ID
- 8 or 16 IDs per bus (depending on SCSI version)

<ConnectionDiagram
  title="Traditional SCSI Bus"
  nodes={[
    { id: 'computer', label: 'Computer', color: colors.blue },
    { id: 'adapter', label: 'Host Adapter', color: colors.green },
    { id: 'disk1', label: 'Disk 1', color: colors.orange },
    { id: 'disk2', label: 'Disk 2', color: colors.orange },
    { id: 'optical', label: 'Optical Drive', color: colors.purple }
  ]}
  connections={[
    { from: 'computer', to: 'adapter', label: 'Control' },
    { from: 'adapter', to: 'disk1', label: 'SCSI Bus' },
    { from: 'adapter', to: 'disk2', label: 'SCSI Bus' },
    { from: 'adapter', to: 'optical', label: 'SCSI Bus' }
  ]}
/>

**SCSI communication:**

- Devices communicate through SCSI command set
- Peer-to-peer relationship possible
- Computer sends commands through host adapter
- Devices relay responses through host adapter

**Modern usage:**

- True SCSI hardware rare in most machines
- Serial Attached SCSI (SAS) offers high performance
- USB storage uses SCSI commands
- ATAPI devices (CD/DVD) use SCSI command set
- SATA disks appear as SCSI devices (via libata translation)

### 3.15.2. Example System

**Device listing:**

```bash
$ lsscsi
[0:0:0:0] disk    ATA WDC WD3200AAJS-2 01.0 /dev/sda
[1:0:0:0] cd/dvd  Slimtype DVD A DS8A5SH XA15 /dev/sr0
[2:0:0:0] disk    USB2.0 CardReader CF 0100 /dev/sdb
[2:0:0:1] disk    USB2.0 CardReader SM XD 0100 /dev/sdc
[2:0:0:2] disk    USB2.0 CardReader MS 0100 /dev/sdd
[2:0:0:3] disk    USB2.0 CardReader SD 0100 /dev/sde
[3:0:0:0] disk    FLASH Drive UT_USB20 0.00 /dev/sdf
```

**Address format: [host:bus:target:lun]**

- **Host:** SCSI host adapter number
- **Bus:** SCSI bus number
- **Target:** Device SCSI ID
- **LUN:** Logical unit number (device subdivision)

**Example system analysis:**

- Four adapters (scsi0, scsi1, scsi2, scsi3)
- Each has single bus (all bus 0)
- One device per bus (all target 0)
- USB card reader at 2:0:0 has four LUNs (one per flash card type)

**NVMe devices:**

- Sometimes appear in lsscsi output
- Shown with `N` as adapter number
- Not actually SCSI devices

### 3.15.3. SCSI Subsystem Architecture

**In plain English:** The SCSI subsystem has three layers like a sandwich - top layer speaks to the rest of the kernel, middle layer routes messages, bottom layer talks to hardware.

**Three-layer structure:**

<StackDiagram
  title="SCSI Subsystem Layers"
  layers={[
    {
      label: 'Top Layer: Device Class Drivers',
      items: ['sd (SCSI Disk)', 'sr (SCSI CD-ROM)', 'st (SCSI Tape)', 'sg (SCSI Generic)'],
      color: colors.blue,
      description: 'Translates kernel requests to SCSI commands'
    },
    {
      label: 'Middle Layer: SCSI Core',
      items: ['Message Routing', 'Bus Management', 'Device Tracking'],
      color: colors.green,
      description: 'Routes messages between layers'
    },
    {
      label: 'Bottom Layer: Hardware Drivers',
      items: ['USB Storage Bridge', 'ATA/SATA Bridge', 'SCSI Host Adapter Drivers'],
      color: colors.orange,
      description: 'Sends/receives hardware-specific messages'
    }
  ]}
/>

**Top layer (device class):**

- Handles operations for device class
- Example: `sd` (SCSI disk) driver
- Translates kernel block device requests to SCSI commands
- Translates SCSI responses back to kernel format

**Middle layer (SCSI core):**

- Moderates and routes SCSI messages
- Keeps track of all SCSI buses and devices
- Manages communication between top and bottom layers

**Bottom layer (hardware-specific):**

- Handles hardware-specific actions
- Sends outgoing SCSI messages to host adapters
- Extracts incoming messages from hardware
- Different drivers for different host adapters

**Why separate layers?**

- SCSI messages uniform for device class
- Host adapters have varying procedures
- Separation allows flexibility and reuse

> **Insight**
>
> For any given device file, the kernel nearly always uses one top-layer driver and one bottom-layer driver. For `/dev/sda`, the kernel uses the `sd` top-layer driver and the ATA bridge bottom-layer driver.

### 3.15.4. USB Storage and SCSI

**In plain English:** USB flash drives understand SCSI commands, but to actually talk to them, the kernel needs to speak USB. So there's a translator that repackages SCSI commands into USB messages.

**USB subsystem similarity:**

- Three-layer structure (like SCSI)
- Device class drivers at top
- Bus management in middle
- Host controller drivers at bottom
- Passes USB messages between components

**USB storage driver:**

- Part of USB subsystem (top layer)
- Acts as translator
- One end speaks SCSI
- Other end speaks USB
- Relatively easy job (hardware includes SCSI in USB)

**Connection to SCSI subsystem:**

- USB storage driver in USB subsystem
- SCSI subsystem needs to talk to USB
- Can't share drivers between subsystems (organizational reasons)
- Simple SCSI bridge driver connects to USB storage driver

<StackDiagram
  title="USB Storage Architecture"
  layers={[
    {
      label: 'SCSI Top Layer',
      items: ['sd (SCSI Disk Driver)'],
      color: colors.blue,
      description: 'SCSI device class driver'
    },
    {
      label: 'SCSI Middle Layer',
      items: ['SCSI Core'],
      color: colors.green,
      description: 'SCSI subsystem core'
    },
    {
      label: 'SCSI Bottom Layer',
      items: ['USB Storage Bridge Driver'],
      color: colors.orange,
      description: 'Connects to USB subsystem'
    },
    {
      label: 'USB Top Layer',
      items: ['USB Storage Driver'],
      color: colors.purple,
      description: 'Translates SCSI to USB'
    },
    {
      label: 'USB Middle Layer',
      items: ['USB Core'],
      color: colors.blue,
      description: 'USB subsystem core'
    },
    {
      label: 'USB Bottom Layer',
      items: ['USB Host Controller Driver'],
      color: colors.green,
      description: 'Talks to USB hardware'
    }
  ]}
/>

### 3.15.5. SCSI and ATA

**In plain English:** SATA hard disks don't speak SCSI natively, so the kernel needs to translate. For optical drives that do speak SCSI (ATAPI), it's easier - just package/unpackage. For hard disks, it's like translating a German book to English while typing it.

**Two different situations:**

1. **Optical drive (ATAPI):** Speaks SCSI commands in ATA protocol
2. **Hard disk:** Doesn't use SCSI commands at all

**libata library:**

- Connects SATA/ATA drives to SCSI subsystem
- Handles both ATAPI and non-SCSI drives

**ATAPI optical drive (simple task):**

- Package SCSI commands into ATA protocol
- Extract SCSI commands from ATA protocol
- Like typing an English book (no understanding needed)

**SATA hard disk (complex task):**

- Full command translation required
- Must understand both command sets
- Must understand commands' purposes
- Like translating German book to English while typing
- Requires understanding of both languages and content

> **Insight**
>
> Despite the translation difficulty, libata successfully makes ATA/SATA interfaces and devices work with the SCSI subsystem. This is a testament to good kernel design and the flexibility of the SCSI command set.

### 3.15.6. Generic SCSI Devices

**In plain English:** Usually programs talk to disks through the normal filesystem. But sometimes you need to send special SCSI commands directly to hardware. That's what generic SCSI devices are for.

**In technical terms:** User processes normally communicate with the SCSI subsystem through block device layers or other kernel services on top of device class drivers. Generic devices allow bypassing class drivers to send SCSI commands directly to devices.

**Why it matters:** Generic devices enable advanced operations that don't fit the standard device model, like optical disc writing or device diagnostics.

**Viewing generic devices:**

```bash
$ lsscsi -g
[0:0:0:0] disk ATA WDC WD3200AAJS-2 01.0 /dev/sda /dev/sg0
[1:0:0:0] cd/dvd Slimtype DVD A DS8A5SH XA15 /dev/sr0 /dev/sg1
[2:0:0:0] disk USB2.0 CardReader CF 0100 /dev/sdb /dev/sg2
[2:0:0:1] disk USB2.0 CardReader SM XD 0100 /dev/sdc /dev/sg3
[2:0:0:2] disk USB2.0 CardReader MS 0100 /dev/sdd /dev/sg4
[2:0:0:3] disk USB2.0 CardReader SD 0100 /dev/sde /dev/sg5
[3:0:0:0] disk FLASH Drive UT_USB20 0.00 /dev/sdf /dev/sg6
```

Each device has both a block device file and a generic device file.

**Example:** Optical drive at `/dev/sr0` has generic device `/dev/sg1`

### 3.15.7. Why Use Generic Devices?

**In plain English:** Some operations are too complex or non-critical to implement in the kernel. Writing optical discs is a good example - it's complicated, not needed by the kernel itself, and better handled by user-space programs.

**CD/DVD writing case study:**

**Reading (kernel driver):**
- Relatively simple operation
- Specialized kernel driver handles it
- Critical for mounting disc filesystems

**Writing (generic device):**
- Significantly more complicated than reading
- No critical system services depend on it
- Better to leave complex code out of kernel
- Safer in user space

**How writing works:**

1. User runs writing program (like cdrecord)
2. Program opens generic device (`/dev/sg1`)
3. Program sends SCSI commands directly to device
4. No kernel driver mediates operations

**Trade-offs:**

- Slightly less efficient than kernel driver
- Much easier to build and maintain
- Safer (bugs don't crash kernel)
- More flexible (easier to update)

### 3.15.8. Multiple Access Methods

**In plain English:** An optical drive can be accessed two ways - through the regular driver for reading and through the generic device for writing. Like having a front door and a service entrance to the same building.

<StackDiagram
  title="Dual Access Paths to Optical Drive"
  layers={[
    { title: 'User Space', color: colors.blue, items: ['Process A (reading via sr)', 'Process B (writing via sg)'] },
    { title: 'Driver Layer', color: colors.green, items: ['sr driver (block)', 'sg driver (generic)'] },
    { title: 'SCSI Middle Layer', color: colors.orange, items: ['Common abstraction for all SCSI'] },
    { title: 'Hardware Driver', color: colors.purple, items: ['Low-level hardware access'] },
    { title: 'Optical Drive', color: colors.slate, items: ['Physical device'] }
  ]}
/>

**Important notes:**

- Two access points exist
- Processes wouldn't normally access simultaneously
- Both go through SCSI middle layer
- Both ultimately reach same hardware

**For hard disks:**

- Even more access layers exist
- More points of access possible
- Chapter 4 explores this in detail

## 3.16. Looking Forward

You've now learned:

- How the kernel presents devices through device files
- The sysfs interface for device information
- How udev automatically configures devices
- Device types and naming conventions
- How the SCSI subsystem works (optional advanced material)

**What you can do now:**

- Identify devices on your system
- Understand device files and their purposes
- Monitor device events with udevadm
- Navigate the sysfs filesystem
- Understand how hardware connects to the kernel

**What's next:**

The next chapter covers disks and filesystems in detail. You'll learn how to:

- Partition disks
- Create filesystems
- Mount and unmount filesystems
- Manage disk space
- Understand filesystem hierarchy

The device knowledge you've gained provides the foundation for working with storage devices effectively.

---

**Previous:** [Chapter 2: Basic Commands and Directory Hierarchy](ch02-basic-commands.md) | **Next:** Chapter 4: Disks and Filesystems
