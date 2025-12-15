---
sidebar_position: 1
title: "Disks and Filesystems"
description: "Master Linux storage fundamentals: partitions, filesystems, LVM, and the layers that connect hardware to your files"
---

import { ProcessFlow, StackDiagram, CardGrid, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# 4. Disks and Filesystems

Understanding how Linux manages disks is fundamental to system administration. This chapter reveals the layers between raw hardware and the files you work with daily, from partition tables to filesystem internals.

## 4.1. Partitioning Disk Devices

**In plain English:** A partition is like dividing a physical hard drive into separate sections, each acting as an independent storage unit.

**In technical terms:** Partitions are subdivisions of a disk defined in a partition table, with each partition presented by the kernel as a separate block device (e.g., /dev/sda1, /dev/sda2).

**Why it matters:** Partitioning allows you to organize data, separate operating systems, and manage different filesystems on a single physical disk.

<StackDiagram
  title="Linux Disk Layers"
  layers={[
    { label: "Applications & Files", color: colors.blue },
    { label: "Filesystem (ext4, xfs)", color: colors.green },
    { label: "Partitions (/dev/sda1, /dev/sda2)", color: colors.yellow },
    { label: "Disk Device (/dev/sda)", color: colors.orange },
    { label: "Physical Hardware", color: colors.red }
  ]}
/>

### 4.1.1. Viewing a Partition Table

**In plain English:** Just like checking the table of contents in a book, you can view how a disk is divided into partitions.

**In technical terms:** The `parted -l` command reads the partition table (MBR or GPT) and displays partition boundaries, types, and filesystem information.

**Why it matters:** Before modifying disks, you must understand their current structure to avoid data loss.

```bash
# View all partition tables on the system
parted -l
```

Sample output showing two different partition table types:

```
Model: ATA KINGSTON SM2280S (scsi)
Disk /dev/sda: 240GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos

Number  Start    End     Size    Type      File system     Flags
 1      1049kB   223GB   223GB   primary   ext4           boot
 2      223GB    240GB   17.0GB  extended
 5      223GB    240GB   17.0GB  logical   linux-swap(v1)

Model: Generic Flash Disk (scsi)
Disk /dev/sdf: 4284MB
Partition Table: gpt

Number  Start    End      Size    File system  Name       Flags
 1      1049kB   1050MB   1049MB              myfirst
 2      1050MB   4284MB   3235MB              mysecond
```

<TreeDiagram
  title="MBR Partition Structure"
  root={{
    label: "Disk (/dev/sda)",
    color: colors.blue,
    children: [
      {
        label: "Primary Partition 1",
        color: colors.green,
        children: [{ label: "ext4 filesystem", color: colors.purple }]
      },
      {
        label: "Extended Partition 2",
        color: colors.orange,
        children: [
          { label: "Logical Partition 5", color: colors.cyan, children: [{ label: "swap space", color: colors.purple }] }
        ]
      }
    ]
  }}
/>

:::info MBR vs GPT
- **MBR (msdos)**: Legacy format, max 4 primary partitions, 2TB disk limit
- **GPT**: Modern format, 128+ partitions, disks larger than 2TB, required for UEFI boot
:::

### 4.1.2. Modifying Partition Tables

**In plain English:** Changing partitions is like remodeling your house - you need to be careful and have a backup plan.

**In technical terms:** Partitioning tools like `fdisk` modify the partition table in memory first, then write changes to disk only when you explicitly commit them.

**Why it matters:** Unlike most file operations, partition changes can make data inaccessible if done incorrectly.

:::warning Critical Safety Rules
1. **Backup first**: Changing partitions can erase filesystem locations
2. **Unmount all**: Ensure no partitions are in use before modifying
3. **Review before writing**: `fdisk` lets you review changes before committing
:::

<CardGrid cards={[
  {
    title: "fdisk (Interactive)",
    description: "Traditional tool with review-before-commit safety. Changes aren't written until you issue 'w' command.",
    color: colors.blue
  },
  {
    title: "parted (Immediate)",
    description: "Modern tool supporting GPT. Changes take effect immediately as you issue commands.",
    color: colors.green
  },
  {
    title: "gparted (Graphical)",
    description: "GUI version of parted. Visual interface makes partition layout easy to understand.",
    color: colors.purple
  }
]} />

### 4.1.3. Creating a Partition Table

Let's walk through creating a practical partition table using `fdisk`:

**Scenario:**
- 4GB USB flash device at /dev/sdd
- Create MBR partition table
- Two partitions: 200MB and 3.8GB for ext4 filesystems

```bash
# Start fdisk (interactive mode)
fdisk /dev/sdd
```

**Step-by-step interaction:**

```
Command (m for help): p                    # Print current table
Command (m for help): d                    # Delete existing partition
Command (m for help): n                    # Create new partition
Partition type: p                          # Primary partition
Partition number: 1                        # First partition
First sector: 2048                         # Default (aligned)
Last sector: +200M                         # Size specification

Command (m for help): n                    # Second partition
Partition type: p
Partition number: 2
First sector: (default)                    # Continue after first
Last sector: (default)                     # Use remaining space

Command (m for help): p                    # Review before writing
Command (m for help): w                    # Write changes to disk
```

**In plain English:** You're telling the disk "divide yourself into two sections" - first 200MB, then use the rest.

**In technical terms:** `fdisk` calculates sector boundaries, updates the MBR partition table, and signals the kernel to re-read the partition information.

**Why it matters:** Proper partition alignment (at 2048 sectors) ensures optimal performance, especially on SSDs.

### 4.1.4. Navigating Disk and Partition Geometry

**In plain English:** Traditional disks have spinning platters with heads that read data, like a record player.

**In technical terms:** Historical CHS (Cylinder-Head-Sector) addressing has been replaced by LBA (Logical Block Addressing), which treats disks as linear sequences of blocks.

**Why it matters:** Modern tools use LBA, so you can ignore reported CHS values - they're often fictional for compatibility.

<ConnectionDiagram
  title="Disk Addressing Evolution"
  nodes={[
    { id: 'old', label: 'CHS Addressing\n(Obsolete)', color: colors.red },
    { id: 'lba', label: 'LBA Addressing\n(Current)', color: colors.green },
    { id: 'part', label: 'Partition Tools', color: colors.blue }
  ]}
  connections={[
    { from: 'old', to: 'lba', label: 'Replaced by' },
    { from: 'lba', to: 'part', label: 'Used by' }
  ]}
/>

### 4.1.5. Reading from Solid-State Disks

**In plain English:** SSDs have no moving parts, so they read data differently - but alignment still matters for performance.

**In technical terms:** SSDs read data in pages (4KB-8KB chunks), and partitions should start at boundaries that are multiples of the page size to avoid double-reads.

**Why it matters:** Misaligned partitions can halve SSD performance by requiring two reads for single operations.

Modern partitioning tools automatically align to 1MB (2048 × 512-byte sectors), which works for all page sizes.

**Checking alignment:**

```bash
# View partition start sector
cat /sys/block/sdf/sdf2/start
1953126

# Check if divisible by 8 (for 4KB pages)
# 1953126 ÷ 8 = not evenly divisible → misaligned!
```

## 4.2. Filesystems

**In plain English:** A filesystem is like a library catalog system that helps you find and organize files by name instead of raw disk locations.

**In technical terms:** Filesystems provide a hierarchical database structure that transforms block devices into directories and files with metadata, permissions, and efficient access patterns.

**Why it matters:** Without filesystems, you'd need to know exact disk block numbers to access data - filesystems give you paths like `/home/user/document.txt`.

<StackDiagram
  title="Filesystem Abstraction Layers"
  layers={[
    { label: "User Applications (ls, cat, vim)", color: colors.blue },
    { label: "VFS (Virtual File System)", color: colors.green },
    { label: "Filesystem Type (ext4, xfs, btrfs)", color: colors.yellow },
    { label: "Block Device Interface", color: colors.orange },
    { label: "Physical Storage", color: colors.red }
  ]}
/>

### 4.2.1. Filesystem Types

**Common Linux Filesystems:**

<CardGrid cards={[
  {
    title: "ext4 (Extended 4)",
    description: "Default for most Linux systems. Reliable, mature, journaled. Supports up to 16TB files and millions of subdirectories.",
    color: colors.blue
  },
  {
    title: "Btrfs (B-tree)",
    description: "Modern filesystem with snapshots, compression, and advanced features. Designed to scale beyond ext4 capabilities.",
    color: colors.green
  },
  {
    title: "XFS",
    description: "High-performance filesystem for large files and parallel I/O. Default on Red Hat Enterprise Linux 7+.",
    color: colors.purple
  },
  {
    title: "FAT/exFAT",
    description: "Windows-compatible. Used on USB drives and SD cards for cross-platform compatibility.",
    color: colors.yellow
  }
]} />

### 4.2.2. Creating a Filesystem

**In plain English:** After partitioning creates the container, you need to format it with a filesystem - like installing shelves in an empty closet.

**In technical terms:** The `mkfs` utility initializes filesystem data structures (superblock, inode tables, block bitmaps) on a partition.

**Why it matters:** Creating a filesystem is destructive - it erases any existing data by reinitializing the storage structures.

```bash
# Create ext4 filesystem on partition 2
mkfs -t ext4 /dev/sdf2
```

:::warning One-Time Operation
Create filesystems only on:
- New partitions with no data
- Partitions where you want to erase all existing data

Creating a filesystem **destroys** previous contents!
:::

**What happens during creation:**

1. **Superblock**: Core filesystem metadata written (mkfs creates backups)
2. **Inode tables**: File metadata structures initialized
3. **Block bitmaps**: Free space tracking structures created
4. **Journal**: Transaction log for crash recovery (ext3/ext4)

### 4.2.3. Mounting a Filesystem

**In plain English:** Mounting is like plugging in a USB drive - it makes the filesystem's files accessible in your directory tree.

**In technical terms:** The `mount` system call attaches a filesystem to a mount point (directory) in the existing directory hierarchy, making its contents accessible at that location.

**Why it matters:** Unmounted filesystems exist on disk but are inaccessible to applications. Mounting integrates them into your system's file namespace.

**Basic mounting:**

```bash
# Mount ext4 partition to /home/extra
mount -t ext4 /dev/sdf2 /home/extra

# View all mounted filesystems
mount
```

**Unmounting:**

```bash
# Detach filesystem (flushes any cached writes)
umount /home/extra
```

<ProcessFlow
  title="Mount Operation Steps"
  steps={[
    { title: "Kernel reads filesystem metadata", color: colors.blue },
    { title: "Verifies filesystem type and integrity", color: colors.green },
    { title: "Creates mount point association", color: colors.yellow },
    { title: "Makes files accessible at mount path", color: colors.orange }
  ]}
/>

### 4.2.4. Filesystem UUID

**In plain English:** Instead of using device names that can change (/dev/sda1 might become /dev/sdb1), filesystems have permanent ID numbers.

**In technical terms:** A UUID (Universally Unique Identifier) is a 128-bit identifier assigned during filesystem creation, providing stable filesystem identification independent of device naming.

**Why it matters:** Device names change based on boot order or hardware changes. UUIDs never change, making them reliable for /etc/fstab entries and boot configurations.

**Viewing UUIDs:**

```bash
# List all block devices with UUIDs
blkid

# Output shows stable identifiers
/dev/sdf2: UUID="b600fe63-d2e9-461c-a5cd-d3b373a5e1d2" TYPE="ext4"
/dev/sda1: UUID="17f12d53-c3d7-4ab3-943e-a0a72366c9fa" TYPE="ext4"
```

**Mounting by UUID:**

```bash
# More reliable than device names
mount UUID=b600fe63-d2e9-461c-a5cd-d3b373a5e1d2 /home/extra
```

### 4.2.5. Disk Buffering, Caching, and Filesystems

**In plain English:** Linux doesn't write changes to disk immediately - it batches them in memory for speed, like taking notes before filing papers.

**In technical terms:** The kernel maintains a write buffer cache in RAM, deferring disk writes for performance while providing a read cache for frequently accessed blocks.

**Why it matters:** This improves performance dramatically but requires proper shutdown to ensure cached writes reach disk before power loss.

:::warning Always Shutdown Properly
Sudden power loss can cause filesystem corruption if pending writes are lost. Always use `shutdown` or `sync` commands.
:::

**Manual synchronization:**

```bash
# Force all pending writes to disk immediately
sync
```

### 4.2.6. Filesystem Mount Options

**In plain English:** Mount options are like switches that control how a filesystem behaves - read-only, execution permissions, etc.

**In technical terms:** Mount options modify kernel behavior for the mounted filesystem, controlling access modes, permission handling, and special features.

**Why it matters:** Options provide security (nosuid), compatibility (uid mapping for FAT), and maintenance capabilities (remount for repairs).

**Common options:**

```bash
# Read-only mount (for safety during repairs)
mount -o ro /dev/sdf2 /home/extra

# Multiple options for FAT filesystem
mount -t vfat /dev/sde1 /dos -o ro,uid=1000
```

<CardGrid cards={[
  {
    title: "ro / rw",
    description: "Read-only or read-write mode. Use ro for write protection or during filesystem checks.",
    color: colors.blue
  },
  {
    title: "exec / noexec",
    description: "Enable or disable program execution. Security measure for removable media.",
    color: colors.green
  },
  {
    title: "suid / nosuid",
    description: "Enable or disable setuid programs. Prevents privilege escalation on untrusted filesystems.",
    color: colors.red
  },
  {
    title: "user",
    description: "Allow unprivileged users to mount. Automatically implies nosuid, noexec, nodev for security.",
    color: colors.yellow
  }
]} />

### 4.2.7. Remounting a Filesystem

**In plain English:** Remounting changes filesystem options without unmounting - like adjusting settings while a USB drive stays plugged in.

**In technical terms:** The remount option modifies mount flags for an already-attached filesystem, commonly used to transition from read-only to read-write mode.

**Why it matters:** During system recovery, the root filesystem boots read-only. Remounting read-write is essential for making repairs.

```bash
# Remount root filesystem as read-write
mount -n -o remount /
```

The `-n` option prevents updating /etc/mtab when the root is still read-only.

### 4.2.8. The /etc/fstab Filesystem Table

**In plain English:** /etc/fstab is like a bookmark list of filesystems to mount automatically at boot time.

**In technical terms:** /etc/fstab is a configuration file specifying filesystem devices (or UUIDs), mount points, types, and options for automatic mounting during system initialization.

**Why it matters:** Without /etc/fstab entries, you'd manually mount all filesystems after every boot.

**Example /etc/fstab:**

```
# Device/UUID                                  Mount    Type    Options              Dump Pass
UUID=70ccd6e7-6ae6-44f6-812c-51aab8036d29    /        ext4    errors=remount-ro    0    1
UUID=592dcfd1-58da-4769-9ea8-5f412a896980    none     swap    sw                   0    0
/dev/sr0                                      /cdrom   iso9660 ro,user,noauto       0    0
```

**Field explanation:**

1. **Device/UUID**: What to mount (prefer UUID for stability)
2. **Mount point**: Where to attach in directory tree
3. **Filesystem type**: ext4, swap, iso9660, etc.
4. **Options**: Comma-separated mount options
5. **Dump**: Obsolete backup flag (always use 0)
6. **Pass**: fsck order (1 for root, 2 for others, 0 to skip)

**Special options:**

- **defaults**: Standard options (rw, suid, dev, exec, auto, nouser, async)
- **errors=remount-ro**: If filesystem error, remount read-only instead of failing
- **noauto**: Don't mount automatically at boot (for removable media)
- **user**: Allow non-root users to mount

### 4.2.9. Alternatives to /etc/fstab

**Modern approaches:**

1. **/etc/fstab.d/** directory: Individual files per filesystem (cleaner organization)
2. **systemd mount units**: Integration with systemd service management

Many systems generate systemd units from /etc/fstab, providing compatibility.

### 4.2.10. Filesystem Capacity

**In plain English:** The `df` command shows how full your filesystems are - like checking fuel gauge levels.

**In technical terms:** `df` queries filesystem metadata to report total capacity, used space, available space, and utilization percentage for mounted filesystems.

**Why it matters:** Monitoring disk usage prevents full filesystems, which can crash services and prevent logins.

```bash
# View filesystem capacity and usage
df

# Human-readable sizes
df -h

# Specific directory's filesystem
df /home
```

**Output:**

```
Filesystem      1K-blocks      Used  Available  Use%  Mounted on
/dev/sda1       214234312  127989560   75339204   63%  /
/dev/sdd2         3043836       4632    2864872    1%  /media/user/uuid
```

:::info Reserved Blocks
You'll notice used + available ≠ total. Filesystems reserve 5% for root-only use, preventing complete filling that would crash system services.
:::

**Finding space hogs:**

```bash
# Disk usage summary for current directory
du -sh *

# Find large directories
du -h --max-depth=1 / | sort -hr | head
```

### 4.2.11. Checking and Repairing Filesystems

**In plain English:** `fsck` is like a filesystem health checkup and repair tool - it fixes corruption from improper shutdowns.

**In technical terms:** `fsck` (filesystem check) verifies filesystem metadata consistency (inodes, block allocation, link counts) and repairs structural damage.

**Why it matters:** Filesystem corruption from crashes or power loss can cause data loss, boot failures, or system instability.

```bash
# Check filesystem (MUST be unmounted!)
fsck /dev/sdb1
```

:::danger Critical Safety Rule
**NEVER** run fsck on a mounted filesystem! The kernel may modify data during the check, causing catastrophic corruption.

**Exception**: Read-only mounted root in single-user mode is safe.
:::

**fsck process phases:**

<ProcessFlow
  title="ext4 Filesystem Check"
  steps={[
    { title: "Pass 1: Check inodes, blocks, sizes", color: colors.blue },
    { title: "Pass 2: Check directory structure", color: colors.green },
    { title: "Pass 3: Check directory connectivity", color: colors.yellow },
    { title: "Pass 4: Check reference counts", color: colors.orange },
    { title: "Pass 5: Check group summary info", color: colors.red }
  ]}
/>

**Common scenarios:**

```bash
# Automatic repair (boot-time style)
fsck -p /dev/sdb1

# Check without modifying
fsck -n /dev/sdb1

# Use backup superblock (if main superblock corrupted)
fsck -b 32768 /dev/sdb1
```

**Journaled filesystems (ext3/ext4):**

```bash
# Flush journal to filesystem
e2fsck -fy /dev/disk_device
```

### 4.2.12. Special-Purpose Filesystems

**In plain English:** Not all filesystems store files on disks - some are interfaces to kernel information.

**In technical terms:** Virtual filesystems provide system interfaces through the filesystem API, presenting kernel data structures as file-like hierarchies without physical storage.

**Why it matters:** These filesystems let you interact with system internals using familiar file operations instead of specialized system calls.

<CardGrid cards={[
  {
    title: "proc (process)",
    description: "Mounted at /proc. Exposes process information (/proc/[PID]) and kernel data (/proc/cpuinfo, /proc/meminfo).",
    color: colors.blue
  },
  {
    title: "sysfs",
    description: "Mounted at /sys. Unified device and driver information hierarchy. Replaces scattered /proc entries.",
    color: colors.green
  },
  {
    title: "tmpfs",
    description: "RAM-backed temporary storage at /run and /tmp. Fast but lost on reboot. Size-limited to prevent memory exhaustion.",
    color: colors.yellow
  },
  {
    title: "overlay",
    description: "Merges multiple directories into a composite view. Used extensively by containers (Docker, Podman).",
    color: colors.purple
  }
]} />

## 4.3. Swap Space

**In plain English:** Swap space is like overflow parking - when RAM fills up, inactive memory pages move to disk temporarily.

**In technical terms:** Swap space is disk storage used by the virtual memory system to page out inactive memory contents, extending available RAM at the cost of much slower access times.

**Why it matters:** Swap prevents out-of-memory crashes but signals that your system needs more RAM if heavily used.

```bash
# View current swap usage
free -h
```

### 4.3.1. Using a Disk Partition as Swap Space

**In plain English:** Setting up swap is like designating a specific parking area for the overflow.

**In technical terms:** The `mkswap` command writes a swap signature to a partition, and `swapon` registers it with the kernel's memory management system.

**Why it matters:** Proper swap configuration prevents out-of-memory killer from terminating critical processes.

**Creating swap partition:**

```bash
# 1. Ensure partition is empty
# 2. Initialize swap signature
mkswap /dev/sda5

# 3. Activate swap space
swapon /dev/sda5
```

**Permanent configuration in /etc/fstab:**

```
UUID=b600fe63-d2e9-461c-a5cd-d3b373a5e1d2  none  swap  sw  0  0
```

### 4.3.2. Using a File as Swap Space

**In plain English:** You can use a regular file as swap if you can't repartition the disk.

**In technical terms:** The kernel supports swap files as an alternative to dedicated partitions, with negligible performance difference on modern systems.

**Why it matters:** Swap files provide flexibility without repartitioning, useful for temporary capacity increases or systems with fixed partitioning.

```bash
# Create 1GB swap file
dd if=/dev/zero of=/swapfile bs=1024k count=1024

# Initialize as swap
mkswap /swapfile

# Activate
swapon /swapfile
```

### 4.3.3. Determining How Much Swap You Need

**In plain English:** The old "2× RAM" rule is outdated - modern systems need less swap due to abundant RAM.

**In technical terms:** Swap requirements depend on workload patterns - servers with inactive processes benefit from swap, while high-performance systems avoid it entirely.

**Why it matters:** Too little swap risks OOM killer activation; too much swap masks underlying memory pressure issues.

**Modern guidelines:**

- **Desktop/laptop**: 1-2GB swap (hibernate support requires RAM size)
- **Server**: Depends on monitoring and workload
- **High-performance**: May use no swap (relies on monitoring and redundancy)

:::warning No Swap Danger
Systems without swap invoke the **OOM killer** when memory exhausts, which kills processes to free memory - possibly critical applications!
:::

## 4.4. The Logical Volume Manager

**In plain English:** LVM is like having flexible storage containers that you can resize, move, and reorganize without rebooting.

**In technical terms:** LVM adds an abstraction layer between physical block devices and filesystems, pooling physical volumes into volume groups from which you carve resizable logical volumes.

**Why it matters:** LVM provides flexibility impossible with fixed partitions - resize filesystems, add disks, and migrate data without downtime.

<StackDiagram
  title="LVM Architecture"
  layers={[
    { label: "Filesystems (ext4, xfs)", color: colors.blue },
    { label: "Logical Volumes (LVs)", color: colors.green },
    { label: "Volume Groups (VGs)", color: colors.yellow },
    { label: "Physical Volumes (PVs)", color: colors.orange },
    { label: "Physical Disks/Partitions", color: colors.red }
  ]}
/>

**Key benefits:**

1. **Add disks on-the-fly**: Extend volume groups without rebooting
2. **Resize filesystems**: Grow or shrink logical volumes as needed
3. **Simplified management**: One pool of storage instead of fixed partitions

### 4.4.1. Working with LVM

**Viewing volume groups:**

```bash
# Summary view
vgs

# Detailed view
vgdisplay
```

**Output:**

```
VG        #PV  #LV  #SN  Attr    VSize    VFree
ubuntu-vg   1    2    0  wz--n-  <10.00g  36.00m
```

**Key concepts:**

- **PV (Physical Volume)**: Disk partition used by LVM
- **VG (Volume Group)**: Pool of one or more PVs
- **LV (Logical Volume)**: Virtual partition carved from VG
- **PE (Physical Extent)**: Fixed-size chunks (typically 4MB) that LVM allocates

**Listing logical volumes:**

```bash
# Summary view
lvs

# Detailed view with device paths
lvdisplay /dev/ubuntu-vg/root
```

**Device naming:**

- Traditional: `/dev/volume-group/logical-volume`
- Mapper: `/dev/mapper/volume--group-logical--volume`
- Generic: `/dev/dm-0`, `/dev/dm-1`, etc. (actual devices)

### 4.4.2. Constructing a Logical Volume System

**Scenario:** Combine 5GB and 15GB disks into 20GB pool, create two 10GB logical volumes.

<TreeDiagram
  title="Example LVM Configuration"
  root={{
    label: "Volume Group: myvg (20GB)",
    color: colors.blue,
    children: [
      {
        label: "Logical Volume: mylv1 (10GB)",
        color: colors.green,
        children: [{ label: "ext4 filesystem", color: colors.purple }]
      },
      {
        label: "Logical Volume: mylv2 (10GB)",
        color: colors.green,
        children: [{ label: "ext4 filesystem", color: colors.purple }]
      }
    ]
  }}
/>

**Step 1: Create physical volumes and volume group**

```bash
# Create VG with first PV
vgcreate myvg /dev/sdb1

# Add second PV to VG
vgextend myvg /dev/sdc1

# Verify
vgs
```

**Step 2: Create logical volumes**

```bash
# Create 10GB logical volumes
lvcreate --size 10g --type linear -n mylv1 myvg
lvcreate --size 10g --type linear -n mylv2 myvg

# Verify
lvs
```

**Step 3: Create filesystems and mount**

```bash
# Format logical volume
mkfs -t ext4 /dev/mapper/myvg-mylv1

# Mount temporarily
mount /dev/mapper/myvg-mylv1 /mnt

# Check space
df -h /mnt
```

**Removing and resizing logical volumes:**

```bash
# Remove logical volume
lvremove myvg/mylv2

# Resize logical volume and filesystem together
lvresize -r -l +100%FREE myvg/mylv1
```

The `-r` option automatically resizes the filesystem to match the new logical volume size.

### 4.4.3. The LVM Implementation

**In plain English:** LVM is split between user-space tools that figure out the layout and a kernel driver that routes data requests.

**In technical terms:** LVM utilities scan physical volumes, construct volume group and logical volume maps, and communicate with the device mapper kernel driver via ioctl() calls.

**Why it matters:** Understanding the implementation helps troubleshoot issues and explains device naming conventions.

<ConnectionDiagram
  title="LVM Components"
  nodes={[
    { id: 'lvm', label: 'LVM Tools\n(pvs, vgs, lvs)', color: colors.blue },
    { id: 'dm', label: 'Device Mapper\n(Kernel Driver)', color: colors.green },
    { id: 'pv', label: 'Physical Volumes\n(/dev/sdb1, /dev/sdc1)', color: colors.orange }
  ]}
  connections={[
    { from: 'lvm', to: 'pv', label: 'Scans PV headers' },
    { from: 'lvm', to: 'dm', label: 'Loads mapping tables' },
    { from: 'dm', to: 'pv', label: 'Routes I/O requests' }
  ]}
/>

**LVM scanning process:**

1. Scan all block devices for PV signatures
2. Read volume group UUIDs from PV headers
3. Verify all PVs for each VG are present
4. Construct logical volume mapping tables
5. Load mappings into device mapper kernel driver

**Device mapper operation:**

```bash
# View device mapper information
dmsetup info

# View mapping tables
dmsetup table
```

The device mapper translates logical volume addresses to physical volume locations at the kernel level.

## 4.5. Looking Forward: Disks and User Space

**In plain English:** The kernel handles raw disk I/O, but you interact with filesystems that make sense of the raw blocks.

**In technical terms:** Clear boundaries exist: kernel manages block I/O and filesystems; user space uses kernel-provided filesystem interfaces and performs initial configuration (partitioning, filesystem creation).

**Why it matters:** This separation allows user-space tools to be flexible and safe, while kernel components provide performance and consistency.

## 4.6. Inside a Traditional Filesystem

**In plain English:** Filesystems use a database of inodes (file records) that point to the actual data blocks on disk.

**In technical terms:** An inode is a data structure containing file metadata (type, permissions, size) and pointers to data blocks. Directories are inodes containing name-to-inode mappings.

**Why it matters:** Understanding inodes explains how hard links work, why rename is fast, and how fsck repairs filesystems.

<TreeDiagram
  title="Inode Structure Example"
  root={{
    label: "Root Inode 2 (directory)",
    color: colors.blue,
    children: [
      {
        label: "dir_1 → Inode 12",
        color: colors.green,
        children: [
          { label: "file_1 → Inode 13", color: colors.purple },
          { label: "file_2 → Inode 14", color: colors.purple },
          { label: "file_3 → Inode 15", color: colors.purple }
        ]
      },
      {
        label: "dir_2 → Inode 7633",
        color: colors.orange,
        children: [
          { label: "file_4 → Inode 7634", color: colors.purple },
          { label: "file_5 → Inode 15 (hard link)", color: colors.cyan }
        ]
      }
    ]
  }}
/>

### 4.6.1. Inode Details and the Link Count

**In plain English:** The link count tells how many directory entries point to a file's inode - multiple names can reference the same data.

**In technical terms:** Link count is the number of directory entries referencing an inode. When count reaches zero, the kernel deallocates the inode and its data blocks.

**Why it matters:** Understanding link counts explains how `rm` works (it decreases link count) and why hard-linked files survive deletion of one name.

```bash
# View inode numbers
ls -i

# Create hard link
ln dir_1/file_3 dir_2/file_5

# Now file_3's inode has link count 2
```

**Deleting files:**

- `rm dir_1/file_2`: Decrements link count from 1 to 0 → inode deleted
- `rm dir_1/file_3`: Decrements link count from 2 to 1 → inode preserved (file_5 still references it)

### 4.6.2. Block Allocation

**In plain English:** Filesystems use a bitmap to track which disk blocks are free versus in-use - like a parking lot occupancy map.

**In technical terms:** A block bitmap is a data structure where each bit represents one block in the data pool (0 = free, 1 = used), enabling efficient allocation and deallocation.

**Why it matters:** When fsck repairs a filesystem, it rebuilds the block bitmap by walking the inode tree, fixing mismatches between recorded and actual usage.

### 4.6.3. Working with Filesystems in User Space

**In plain English:** User programs access files through standard operations (open, read, write) without knowing filesystem internals.

**In technical terms:** The VFS (Virtual File System) layer provides a unified system call interface, abstracting filesystem implementation details from user-space applications.

**Why it matters:** This abstraction allows programs to work with any filesystem type without modification, and enables non-traditional filesystems (network, virtual).

**System call abstraction:**

- `open()`, `read()`, `write()` work the same for ext4, xfs, btrfs, NFS
- Inode numbers and link counts are exposed for compatibility
- Not all filesystems support all traditional Unix operations (e.g., FAT doesn't support hard links)

---

## Summary

You've mastered the complete storage stack:

1. **Partitioning**: Dividing disks with MBR or GPT tables
2. **Filesystems**: Creating, mounting, and managing ext4 and other types
3. **Swap Space**: Extending virtual memory to disk
4. **LVM**: Flexible volume management for dynamic storage
5. **Internals**: How inodes and block allocation work

**Next up**: Chapter 5 explores how the Linux kernel boots, loading from disk into memory and starting the first user-space process.
