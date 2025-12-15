---
sidebar_position: 2
title: "A Closer Look at Processes and Resource Utilization"
description: "Deep dive into process management, resource monitoring, CPU/memory/IO performance analysis, and control groups (cgroups) for managing system resources."
---

import { ProcessFlow, StackDiagram, CardGrid, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# A Closer Look at Processes and Resource Utilization

This chapter explores the intricate relationships between processes, the kernel, and system resources. You'll learn how the kernel allocates three fundamental hardware resources: CPU, memory, and I/O.

The tools in this chapter are often called "performance-monitoring tools." They're invaluable when your system slows down. However, resist the temptation to optimize prematurely. Default settings are well-chosen; concentrate instead on understanding what these tools measure, and you'll gain deep insight into kernel behavior.

## 1. Tracking Processes

### 1.1. Interactive Process Monitoring with top

**What it is:** An interactive program that shows real-time process information and system status.

**Why it matters:** While `ps` shows a snapshot, `top` updates continuously, revealing which processes consume the most resources.

**How it works:** `top` displays processes sorted by activity (CPU usage by default), updating every 3 seconds.

**Key commands:**

<CardGrid
  title="Essential top Commands"
  cards={[
    {
      title: 'Spacebar',
      description: 'Update display immediately',
      color: colors.blue
    },
    {
      title: 'M',
      description: 'Sort by memory usage',
      color: colors.green
    },
    {
      title: 'T',
      description: 'Sort by cumulative CPU time',
      color: colors.purple
    },
    {
      title: 'P',
      description: 'Sort by current CPU usage (default)',
      color: colors.orange
    },
    {
      title: 'u',
      description: 'Show only one user\'s processes',
      color: colors.yellow
    },
    {
      title: 'f',
      description: 'Select different display fields',
      color: colors.red
    },
    {
      title: '?',
      description: 'Display help',
      color: colors.gray
    }
  ]}
/>

:::info Case-Sensitive Commands
All `top` keystroke commands are case-sensitive. `M` and `m` are different commands.
:::

**Enhanced alternatives:**
- **htop**: Enhanced interface with better visuals
- **atop**: Advanced features including historical data

## 2. Finding Open Files with lsof

### 2.1. Understanding lsof

**What it is:** Lists all open files and the processes using them.

**Why it matters:** In Unix, everything is a file—regular files, network sockets, pipes, devices. `lsof` reveals what processes are doing.

**How it works:** Queries kernel data structures to show all open file descriptors system-wide.

### 2.2. Reading lsof Output

**Sample output:**

```
COMMAND    PID  USER   FD   TYPE DEVICE  SIZE/OFF    NODE NAME
systemd      1  root  cwd    DIR    8,1      4096       2 /
systemd      1  root  rtd    DIR    8,1      4096       2 /
systemd      1  root  txt    REG    8,1   1595792 9961784 /lib/systemd/systemd
systemd      1  root  mem    REG    8,1   1700792 9961570 /lib/x86_64-linux-gnu/libm-2.27.so
vi        1994 juser  cwd    DIR    8,1      4096 4587522 /home/juser
vi        1994 juser    3u   REG    8,1     12288  786440 /tmp/.ff.swp
```

<CardGrid
  title="lsof Output Fields"
  cards={[
    {
      title: 'COMMAND',
      description: 'Program name',
      color: colors.blue
    },
    {
      title: 'PID',
      description: 'Process ID',
      color: colors.green
    },
    {
      title: 'USER',
      description: 'User running the process',
      color: colors.purple
    },
    {
      title: 'FD',
      description: 'File descriptor or purpose (cwd, txt, mem, or number)',
      color: colors.orange
    },
    {
      title: 'TYPE',
      description: 'File type (REG, DIR, socket, etc.)',
      color: colors.yellow
    },
    {
      title: 'DEVICE',
      description: 'Major and minor device numbers',
      color: colors.red
    },
    {
      title: 'SIZE/OFF',
      description: 'File size or offset',
      color: colors.cyan
    },
    {
      title: 'NODE',
      description: 'Inode number',
      color: colors.gray
    },
    {
      title: 'NAME',
      description: 'Filename or description',
      color: colors.blue
    }
  ]}
/>

**Common FD values:**
- `cwd`: Current working directory
- `rtd`: Root directory
- `txt`: Program code
- `mem`: Memory-mapped file
- `0`, `1`, `2`: stdin, stdout, stderr
- `3u`, `4w`, etc.: File descriptor (u=read/write, w=write, r=read)

:::info Run as Root
You'll get more complete information running `lsof` as root than as a regular user.
:::

### 2.3. Using lsof Effectively

**Two approaches:**

**Approach 1: Pipe to search**
```bash
lsof | less
# Search within less
```

**Approach 2: Use filters**

List files in `/usr` and subdirectories:
```bash
lsof +D /usr
```

List files for specific process:
```bash
lsof -p 1994
```

List files for specific user:
```bash
lsof -u username
```

**Brief help:**
```bash
lsof -h
```

:::warning Kernel Dependency
`lsof` relies heavily on kernel information. After a kernel update, you may need to reboot before the new `lsof` works correctly.
:::

## 3. Tracing Program Execution and System Calls

### 3.1. Understanding strace

**What it is:** A tool that displays every system call a process makes.

**Why it matters:** When programs fail immediately or behave mysteriously, `strace` shows exactly what they're asking the kernel to do.

**How it works:** Intercepts and records all system calls between a process and the kernel.

**Basic usage:**
```bash
strace cat /dev/null
```

**Save output to file:**
```bash
strace -o output.txt cat /dev/null
```

Or redirect stderr:
```bash
strace cat /dev/null 2> output.txt
```

### 3.2. Reading strace Output

**Program startup** (fork/exec):
```
execve("/bin/cat", ["cat", "/dev/null"], 0x7ffef0be0248 /* 59 vars */) = 0
brk(NULL) = 0x561e83127000
```

**Loading shared libraries** (skip this section initially):
```
access("/etc/ld.so.nohwcap", F_OK) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=119531, ...}) = 0
mmap(NULL, 119531, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fa9db241000
close(3) = 0
```

**Actual work** (the interesting part):
```
openat(AT_FDCWD, "/dev/null", O_RDONLY) = 3
fstat(3, {st_mode=S_IFCHR|0666, st_rdev=makedev(0x1, 3), ...}) = 0
read(3, "", 131072) = 0
close(3) = 0
close(1) = 0
close(2) = 0
exit_group(0) = ?
+++ exited with 0 +++
```

**Key observations:**
1. `openat()` opens `/dev/null` → returns file descriptor 3
2. `read(3, "", 131072)` reads from fd 3 → returns 0 (EOF)
3. Program closes files and exits successfully

### 3.3. Error Handling in strace

**Failed system call example:**
```bash
strace cat not_a_file
```

Output shows:
```
openat(AT_FDCWD, "not_a_file", O_RDONLY) = -1 ENOENT (No such file or directory)
```

**Understanding errors:**
- Return value `-1` indicates failure
- `ENOENT` is the error code
- Description helps interpret the problem

:::info Finding Missing Files
Missing files are the most common Unix program problem. `strace` is invaluable for tracking them down, especially when logs don't help.
:::

### 3.4. Tracing Daemons

**What it is:** Using `strace` on background processes that fork or detach.

**How to do it:**
```bash
strace -o daemon_trace -ff crummyd
```

**Options explained:**
- `-o daemon_trace`: Output base filename
- `-ff`: Follow forks; create separate file per child process
- Output files: `daemon_trace.pid` where `pid` is each process ID

### 3.5. Library Call Tracing with ltrace

**What it is:** Like `strace`, but tracks shared library calls instead of system calls.

**Why it exists:** Shows higher-level function calls (printf, malloc, etc.) vs low-level system calls.

**How to use:**
```bash
ltrace cat /dev/null
```

:::warning Volume of Output
Library calls are far more numerous than system calls. Heavy filtering is essential. `ltrace` has many built-in options to help.
:::

**Limitation:** Doesn't work on statically-linked binaries.

## 4. Threads

### 4.1. Understanding Threads

**What they are:** Lightweight execution units within a process that share memory and resources.

**Why they exist:** Allow parallel computation and efficient I/O handling without the overhead of separate processes.

**How they differ from processes:**

<CardGrid
  title="Processes vs Threads"
  cards={[
    {
      title: 'Separate Processes',
      description: 'Independent memory, separate resources, isolated execution',
      color: colors.blue
    },
    {
      title: 'Threads in Process',
      description: 'Shared memory, shared resources, concurrent execution',
      color: colors.green
    }
  ]}
/>

**Thread characteristics:**
- Has Thread ID (TID)
- Scheduled independently by kernel
- Shares memory with other threads in same process
- Shares I/O connections with other threads

### 4.2. Single-threaded vs Multithreaded

**Single-threaded**: Process has one thread (the main thread). Most processes are single-threaded.

**Multithreaded**: Process has multiple threads. Main thread creates additional threads.

**Advantages of multithreading:**
- **Parallel computation**: Threads run simultaneously on multiple CPU cores
- **Faster startup**: Creating threads is faster than forking processes
- **Efficient communication**: Shared memory is faster than pipes/sockets
- **I/O management**: Handle multiple streams without forking

### 4.3. Viewing Threads

**Basic ps with threads:**
```bash
ps m
```

**Sample output:**
```
PID   TTY   STAT   TIME COMMAND
3587  pts/3   -    0:00 bash
  -     -    Ss    0:00 -
12534 tty7    -  668:30 /usr/lib/xorg/Xorg
  -     -   Ssl+ 659:55 -
  -     -   Ssl+   0:00 -
  -     -   Ssl+   8:35 -
```

**Interpretation:**
- Lines with PIDs are processes
- Lines with dashes in PID column are threads
- Process 3587: single-threaded
- Process 12534: multithreaded (4 threads total)

**Custom output showing TIDs:**
```bash
ps m -o pid,tid,command
```

**Output:**
```
PID    TID COMMAND
3587     - bash
   -  3587 -
12534    - /usr/lib/xorg/Xorg
   - 12534 -
   - 13227 -
   - 14443 -
```

**Observation:** Single-threaded processes have TID = PID (the main thread).

**Viewing threads in top:**
- Press `H` to toggle thread view

:::warning Thread Interaction
Normally, you don't interact with individual threads. You need intimate knowledge of the program's threading model, and even then, it's risky.
:::

## 5. Introduction to Resource Monitoring

### 5.1. Resource Philosophy

**What it is:** Understanding that monitoring is about insight, not optimization.

**Why it matters:** Most systems perform well by default. Premature optimization wastes time.

**Focus on:** Learning how the kernel divides resources among processes.

**Three fundamental resources:**

<StackDiagram
  title="System Resource Hierarchy"
  layers={[
    { title: 'CPU', description: 'Processor time for computation', color: colors.blue },
    { title: 'Memory', description: 'RAM for process data and code', color: colors.green },
    { title: 'I/O', description: 'Disk, network, and device access', color: colors.orange }
  ]}
/>

### 5.2. Measuring CPU Time

**What it is:** Quantifying how much processor time a process consumes.

**Why it matters:** Excessive CPU usage by one process can slow the entire system.

**Monitor specific processes:**
```bash
top -p pid1 -p pid2
```

**Measure program lifetime:**
```bash
time ls
```

**Sample output:**
```
real    0m0.442s
user    0m0.052s
sys     0m0.091s
```

<CardGrid
  title="Time Command Output"
  cards={[
    {
      title: 'user',
      description: 'CPU time running program code',
      color: colors.blue
    },
    {
      title: 'sys (system)',
      description: 'CPU time kernel spends on process\'s work',
      color: colors.green
    },
    {
      title: 'real (elapsed)',
      description: 'Total wall-clock time from start to finish',
      color: colors.purple
    }
  ]}
/>

**Interpreting results:**
- **user + sys**: Actual CPU time
- **real - (user + sys)**: Time waiting for external resources (network, disk)

**Use system time command** for detailed stats:
```bash
/usr/bin/time cal > /dev/null
```

Output includes page faults and other metrics.

### 5.3. Adjusting Process Priorities

**What it is:** Influencing how the kernel schedules CPU time for processes.

**Why it matters:** You can make some processes more or less important than others.

**How it works:**

<CardGrid
  title="Scheduling Parameters"
  cards={[
    {
      title: 'Priority (PR)',
      description: 'Kernel\'s current scheduling priority (-20 to 20)',
      color: colors.blue
    },
    {
      title: 'Nice Value (NI)',
      description: 'User-settable hint to kernel (default 0)',
      color: colors.green
    }
  ]}
/>

**Relationship:** Kernel adds nice value to base priority to determine actual priority.

**View priorities in top:**
```
PID USER  PR  NI  VIRT   RES   SHR S %CPU %MEM    TIME+ COMMAND
28883 bri  20   0 1280m  763m   32m S   58 12.7 213:00.65 chromium
```

**Nice value interpretation:**
- **0**: Normal priority (default)
- **Higher (positive)**: Lower priority, "nicer" to other processes
- **Lower (negative)**: Higher priority (requires root)

**Increase nice value** (lower priority):
```bash
renice 20 pid
```

This makes the process run only when CPU is otherwise idle.

**Set nice value when starting:**
```bash
nice -n 15 long_computation
```

:::warning Root Nice Values
Only root can set negative nice values. This is almost always a bad idea—system processes may starve.
:::

**Modern relevance:** Less important than in multi-user systems of the past. Single-user workstations rarely need manual priority adjustment.

### 5.4. Load Averages

**What it is:** The average number of processes ready to run (not waiting for I/O).

**Why it matters:** Indicates overall system CPU demand.

**How to check:**
```bash
uptime
```

**Sample output:**
```
... up 91 days, ... load average: 0.08, 0.03, 0.01
```

**Three numbers:**
- **0.08**: 1-minute average
- **0.03**: 5-minute average
- **0.01**: 15-minute average

**Interpreting load averages:**

<CardGrid
  title="Load Average Interpretation"
  cards={[
    {
      title: '0.0 - 1.0 (single core)',
      description: 'Good. CPU has idle time, saves power.',
      color: colors.green
    },
    {
      title: '~1.0 (single core)',
      description: 'One process using CPU constantly.',
      color: colors.yellow
    },
    {
      title: '> cores',
      description: 'Processes competing for CPU.',
      color: colors.orange
    },
    {
      title: '>> cores',
      description: 'High load. Check if memory/IO is the bottleneck.',
      color: colors.red
    }
  ]}
/>

**Multi-core systems:**
- 4 cores, load average 2.0 = 50% utilization
- 4 cores, load average 4.0 = 100% utilization
- 4 cores, load average 8.0 = overloaded, processes waiting

**High load scenarios:**

1. **Good high load**: Plenty of memory and I/O; system responsive
2. **Bad high load**: Low memory; kernel thrashing (swapping); system sluggish

:::info Modern Desktops
Current websites and web browsers can consume significant CPU. A load average slightly above 0 is now normal.
:::

### 5.5. Memory Monitoring

#### 5.5.1. Basic Memory Check

**Simple command:**
```bash
free
```

**Or view details:**
```bash
cat /proc/meminfo
```

**What to look for:** Amount of memory used for caches and buffers.

**Warning sign:** If cache/buffer memory is very low and real memory is nearly full, you may need more RAM.

:::warning Don't Blame Memory Prematurely
Not every performance problem is due to insufficient memory. Investigate thoroughly before assuming you need more RAM.
:::

#### 5.5.2. How Memory Works

**What it is:** The kernel's on-demand paging system.

**Why it matters:** Understanding paging explains memory performance.

**How it works:**

<ProcessFlow
  title="On-Demand Paging"
  steps={[
    { title: 'Process Starts', description: 'Kernel loads initial code pages', color: colors.blue },
    { title: 'Execution Begins', description: 'Process runs with minimal memory', color: colors.green },
    { title: 'Page Fault', description: 'Process accesses unmapped memory', color: colors.orange },
    { title: 'Kernel Intervenes', description: 'Loads needed page into memory', color: colors.purple },
    { title: 'Execution Resumes', description: 'Process continues', color: colors.green }
  ]}
/>

**Key concepts:**

<CardGrid
  title="Memory Management Concepts"
  cards={[
    {
      title: 'Virtual Address',
      description: 'Address process uses (not real memory location)',
      color: colors.blue
    },
    {
      title: 'Page',
      description: 'Fixed-size memory chunk (typically 4KB)',
      color: colors.green
    },
    {
      title: 'Page Table',
      description: 'Maps virtual pages to real memory pages',
      color: colors.purple
    },
    {
      title: 'MMU',
      description: 'Hardware that translates virtual to real addresses',
      color: colors.orange
    }
  ]}
/>

**Check page size:**
```bash
getconf PAGE_SIZE
```

Typical output: `4096` (4KB)

#### 5.5.3. Page Faults

**What they are:** Events when a process accesses memory not yet mapped by the MMU.

**Why they occur:** Kernel uses on-demand paging; not all memory is loaded immediately.

**Two types:**

<CardGrid
  title="Page Fault Types"
  cards={[
    {
      title: 'Minor Page Fault',
      description: 'Page in memory, but MMU doesn\'t know where. Quick to resolve.',
      color: colors.green
    },
    {
      title: 'Major Page Fault',
      description: 'Page not in memory. Must load from disk. Slow.',
      color: colors.red
    }
  ]}
/>

**Minor page fault causes:**
- Process requests more memory
- MMU's internal table is full

**Major page fault causes:**
- First time loading program code from disk (unavoidable)
- Memory shortage forcing kernel to swap (problematic)

:::warning Thrashing
When the system runs out of memory, the kernel swaps pages to disk. Excessive swapping (thrashing) severely degrades performance.
:::

#### 5.5.4. Measuring Page Faults

**Using time command:**
```bash
/usr/bin/time cal > /dev/null
```

**Output:**
```
0.00user 0.00system 0:00.06elapsed 0%CPU (0avgtext+0avgdata 3328maxresident)k
648inputs+0outputs (2major+254minor)pagefaults 0swaps
```

**Observation:**
- 2 major page faults (loading program from disk)
- 254 minor page faults (normal operation)
- Running again likely shows 0 major faults (program cached)

**Using top:**
1. Press `f` to select fields
2. Add `nMaj` (total major faults)
3. Add `vMj` (major faults since last update)

**Using ps:**
```bash
ps -o pid,min_flt,maj_flt 20365
```

**Output:**
```
PID   MINFL   MAJFL
20365 834182     23
```

### 5.6. CPU and Memory Performance with vmstat

**What it is:** A tool providing high-level system-wide performance statistics.

**Why it matters:** Low overhead, continuous monitoring, comprehensive view of CPU, memory, swap, and I/O.

**Basic usage:**
```bash
vmstat 2
```

This updates every 2 seconds.

**Sample output:**
```
procs -----------memory---------- ---swap-- -----io---- -system-- ----cpu----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa
 2  0 320416 3027696 198636 1072568   0    0     1     1    2    0 15  2 83  0
 2  0 320416 3027288 198636 1072564   0    0     0  1182  407  636  1  0 99  0
```

<CardGrid
  title="vmstat Column Groups"
  cards={[
    {
      title: 'procs',
      description: 'r: running, b: blocked (waiting for I/O)',
      color: colors.blue
    },
    {
      title: 'memory',
      description: 'swpd: swapped, free: free, buff: buffers, cache: cache',
      color: colors.green
    },
    {
      title: 'swap',
      description: 'si: swapped in, so: swapped out (KB/s)',
      color: colors.red
    },
    {
      title: 'io',
      description: 'bi: blocks in, bo: blocks out (from/to disk)',
      color: colors.yellow
    },
    {
      title: 'system',
      description: 'in: interrupts, cs: context switches',
      color: colors.purple
    },
    {
      title: 'cpu',
      description: 'us: user, sy: system, id: idle, wa: I/O wait',
      color: colors.orange
    }
  ]}
/>

**Idle system interpretation:**
- `swpd`: 320,416 KB swapped out (but not actively swapping)
- `si` and `so`: Both 0 (no swapping activity)
- `free`: ~3 GB free memory
- CPU: 1% user, 0% system, 99% idle

:::info First Line
The first line shows averages since boot. Focus on subsequent lines for current activity.
:::

**Active system example:**
```
procs -----------memory---------- ---swap-- -----io---- -system-- ----cpu----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa
 1  0 320412 2861252 198920 1106804   0    0     0     0 2477 4481 25  2 72  0
 1  1 320412 2817860 199332 1146052   0    0 19912     0 2446 4223 26  3 63  8
 2  2 320252 2772076 201076 1166656  10    0  2142  1190 4188 7537 30  3 53 14
```

**Observations:**
- CPU usage increasing (25-30% user time)
- Disk activity high (`bi` and `bo` columns)
- Some blocked processes (`b` column)
- Cache growing (kernel caching disk data)
- Minor swap-in activity (`si` = 10)

**Out-of-memory scenario:**
- Free memory → 0
- Buffer and cache → decrease
- `so` (swap-out) → increases dramatically
- `sy` (system time) → increases (kernel working hard)
- `b` (blocked) → many processes waiting
- System becomes sluggish

### 5.7. I/O Monitoring

#### 5.7.1. Using iostat

**What it is:** A tool for monitoring disk I/O statistics.

**Why it matters:** Disk I/O can be a major performance bottleneck.

**Basic usage:**
```bash
iostat
```

**Sample output:**
```
avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           4.46    0.01    0.67    0.31    0.00   94.55

Device:            tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
sda               4.67         7.28        49.86    9493727   65011716
sde               0.00         0.00         0.00       1230          0
```

<CardGrid
  title="iostat Device Metrics"
  cards={[
    {
      title: 'tps',
      description: 'Transfers per second',
      color: colors.blue
    },
    {
      title: 'kB_read/s',
      description: 'Kilobytes read per second',
      color: colors.green
    },
    {
      title: 'kB_wrtn/s',
      description: 'Kilobytes written per second',
      color: colors.orange
    },
    {
      title: 'kB_read',
      description: 'Total kilobytes read',
      color: colors.purple
    },
    {
      title: 'kB_wrtn',
      description: 'Total kilobytes written',
      color: colors.red
    }
  ]}
/>

**Continuous monitoring:**
```bash
iostat 2
```

**Device-only report:**
```bash
iostat -d 2
```

**Show partition details:**
```bash
iostat -p ALL
```

**Sample partition output:**
```
Device:            tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
sda               4.67         7.27        49.83    9496139   65051472
sda1              4.38         7.16        49.51    9352969   64635440
sda2              0.00         0.00         0.00          6          0
sda5              0.01         0.11         0.32     141884     416032
```

**Interpretation:** Partition stats include some overlap with disk stats, but reading the partition table directly from `sda` isn't included in partition totals.

#### 5.7.2. Per-Process I/O with iotop

**What it is:** Like `top`, but for I/O activity instead of CPU.

**Why it matters:** Identifies which processes are causing disk bottlenecks.

**Usage:**
```bash
sudo iotop
```

**Sample output:**
```
Total DISK READ: 4.76 K/s | Total DISK WRITE: 333.31 K/s
  TID  PRIO  USER     DISK READ  DISK WRITE  SWAPIN   IO>    COMMAND
  260  be/3  root        0.00 B/s   38.09 K/s  0.00 %  6.98 % [jbd2/sda1-8]
 2611  be/4  juser       4.76 K/s   10.32 K/s  0.00 %  0.21 % zeitgeist-daemon
```

<CardGrid
  title="iotop Fields"
  cards={[
    {
      title: 'TID',
      description: 'Thread ID (not PID)',
      color: colors.blue
    },
    {
      title: 'PRIO',
      description: 'I/O priority (scheduling class/level)',
      color: colors.green
    },
    {
      title: 'DISK READ/WRITE',
      description: 'Current I/O rates',
      color: colors.orange
    },
    {
      title: 'IO>',
      description: 'Percentage of time process is doing I/O',
      color: colors.purple
    }
  ]}
/>

**I/O Priority format:** `be/4`
- `be`: Best effort (scheduling class)
- `4`: Priority level (lower = higher priority)

**I/O Scheduling classes:**

<CardGrid
  title="I/O Scheduling Classes"
  cards={[
    {
      title: 'be (best effort)',
      description: 'Normal I/O. Kernel schedules fairly.',
      color: colors.blue
    },
    {
      title: 'rt (real-time)',
      description: 'High-priority I/O. Always scheduled first.',
      color: colors.red
    },
    {
      title: 'idle',
      description: 'Low-priority I/O. Only when nothing else needs I/O.',
      color: colors.gray
    }
  ]}
/>

**Change I/O priority:**
```bash
ionice -c 3 -p pid  # Set to idle class
ionice -c 2 -n 7 -p pid  # Set to best-effort, priority 7
```

### 5.8. Per-Process Monitoring with pidstat

**What it is:** Continuous per-process resource monitoring without screen-clearing updates.

**Why it matters:** Unlike `top`, `pidstat` shows historical progression, making it easier to spot trends.

**Basic usage** (CPU monitoring):
```bash
pidstat -p 1329 1
```

**Sample output:**
```
Linux 5.4.0-48-generic (duplex)     11/09/2020     _x86_64_    (4 CPU)

09:26:55 PM   UID       PID    %usr %system  %guest    %CPU   CPU  Command
09:27:03 PM  1000      1329    8.00    0.00    0.00    8.00     1  myprocess
09:27:04 PM  1000      1329    0.00    0.00    0.00    0.00     3  myprocess
09:27:05 PM  1000      1329    3.00    0.00    0.00    3.00     1  myprocess
```

**Column interpretation:**
- `%usr`: User mode CPU percentage
- `%system`: Kernel mode CPU percentage
- `%CPU`: Total CPU percentage
- `CPU`: Which CPU core the process ran on

**Memory monitoring:**
```bash
pidstat -r -p 1329 1
```

**Disk I/O monitoring:**
```bash
pidstat -d -p 1329 1
```

**Additional features:**
- Thread monitoring
- Context switch tracking
- Page fault statistics

See `pidstat(1)` manual for complete options.

## 6. Control Groups (cgroups)

### 6.1. Understanding cgroups

**What they are:** A kernel feature for grouping processes and limiting their resource consumption.

**Why they exist:** Traditional per-process limits (like `nice`) are insufficient for complex resource management.

**How they work:**

<ProcessFlow
  title="cgroup Resource Control"
  steps={[
    { title: 'Create cgroup', description: 'Define resource group', color: colors.blue },
    { title: 'Add processes', description: 'Assign processes to group', color: colors.green },
    { title: 'Enable controllers', description: 'Activate resource limits', color: colors.orange },
    { title: 'Set limits', description: 'Configure memory, CPU, I/O limits', color: colors.purple }
  ]}
/>

**Available controllers:**
- `cpu`: Limit processor time
- `memory`: Limit memory usage
- `io`: Limit disk I/O
- `pids`: Limit number of processes

:::info systemd Integration
systemd uses cgroups extensively, but cgroups are a kernel feature independent of systemd.
:::

### 6.2. cgroup Versions

**What they are:** Two incompatible cgroup architectures (v1 and v2).

**Why both exist:** v2 is newer and better, but v1 is still widely deployed.

**Version 1 architecture:**
- Separate cgroup per controller
- Process can belong to multiple cgroups (one per controller)
- Complex to manage

<ConnectionDiagram
  title="cgroups v1 Architecture"
  nodes={[
    { id: 'procA', label: 'Process A', color: colors.blue },
    { id: 'cpuA', label: 'cpu cgroup A', color: colors.green },
    { id: 'memA', label: 'memory cgroup A', color: colors.orange }
  ]}
  connections={[
    { from: 'procA', to: 'cpuA', label: 'cpu limit' },
    { from: 'procA', to: 'memA', label: 'memory limit' }
  ]}
/>

**Version 2 architecture:**
- One cgroup per process
- Multiple controllers per cgroup
- Simpler and cleaner

<ConnectionDiagram
  title="cgroups v2 Architecture"
  nodes={[
    { id: 'procB', label: 'Process B', color: colors.blue },
    { id: 'cgroupB', label: 'cgroup B\n(cpu + memory)', color: colors.purple }
  ]}
  connections={[
    { from: 'procB', to: 'cgroupB', label: 'belongs to' }
  ]}
/>

**Check your cgroups:**
```bash
cat /proc/self/cgroup
```

**Sample v1 output:**
```
12:rdma:/
11:net_cls,net_prio:/
10:perf_event:/
8:cpu,cpuacct:/user.slice
6:memory:/user.slice
1:name=systemd:/user.slice/user-1000.slice/session-2.scope
0::/user.slice/user-1000.slice/session-2.scope
```

**Sample v2-only output:**
```
0::/user.slice/user-1000.slice/session-2.scope
```

**Line interpretation:**
- Lines 2-12: cgroups v1 (controller names visible)
- Line 1: v1 management cgroup (no controller)
- Line 0: cgroups v2

:::info Transition Period
Many systems run both v1 and v2 simultaneously. We'll focus on v2 because v1 is being phased out.
:::

### 6.3. Viewing cgroups

**What it is:** Examining cgroup configuration through the filesystem.

**Where to look:** `/sys/fs/cgroup` (v2) or `/sys/fs/cgroup/unified` (v2 on hybrid systems)

**Find your shell's cgroup:**
```bash
cat /proc/self/cgroup
```

**Example output:**
```
0::/user.slice/user-1000.slice/session-2.scope
```

**Navigate to cgroup directory:**
```bash
cd /sys/fs/cgroup/user.slice/user-1000.slice/session-2.scope/
ls
```

**Key interface files:**

<CardGrid
  title="cgroup Interface Files"
  cards={[
    {
      title: 'cgroup.procs',
      description: 'List of PIDs in this cgroup',
      color: colors.blue
    },
    {
      title: 'cgroup.threads',
      description: 'List of PIDs and TIDs (includes threads)',
      color: colors.green
    },
    {
      title: 'cgroup.controllers',
      description: 'Available controllers for this cgroup',
      color: colors.purple
    },
    {
      title: 'cgroup.subtree_control',
      description: 'Controllers enabled for child cgroups',
      color: colors.orange
    }
  ]}
/>

**View processes in cgroup:**
```bash
cat cgroup.procs
```

**View available controllers:**
```bash
cat cgroup.controllers
```

**Typical output:**
```
memory pids
```

### 6.4. Controller-Specific Files

**What they are:** Files prefixed with controller name that show or configure limits.

**Memory controller files:**
- `memory.max`: Maximum memory limit
- `memory.current`: Current memory usage
- `memory.stat`: Detailed memory statistics

**Example - view memory limit:**
```bash
cat memory.max
```

**Output:**
```
max
```

This means no explicit limit (may be limited by parent cgroup).

**PID controller files:**
- `pids.max`: Maximum number of processes
- `pids.current`: Current number of processes

**Example - view current process count:**
```bash
cat pids.current
```

**Output:**
```
4
```

**CPU usage** (available even without cpu controller):
```bash
cat cpu.stat
```

**Output:**
```
usage_usec 4617481
user_usec 2170266
system_usec 2447215
```

This shows cumulative CPU time over the cgroup's lifetime.

### 6.5. Manipulating cgroups

**What it is:** Moving processes to cgroups and changing resource limits.

**Add process to cgroup:**
```bash
echo pid > cgroup.procs
```

**Set PID limit:**
```bash
echo 3000 > pids.max
```

**Remove limit:**
```bash
echo max > pids.max
```

### 6.6. Creating cgroups

**What it is:** Making new cgroup subdirectories.

**How to create:**
```bash
mkdir /sys/fs/cgroup/my-cgroup
```

The kernel automatically creates interface files.

**Remove empty cgroup:**
```bash
rmdir /sys/fs/cgroup/my-cgroup
```

**cgroup Creation Rules:**

<CardGrid
  title="cgroup Constraints"
  cards={[
    {
      title: 'Leaf Node Rule',
      description: 'Can only put processes in leaf (outermost) cgroups',
      color: colors.blue
    },
    {
      title: 'Controller Inheritance',
      description: 'Child cgroup can\'t have controllers parent doesn\'t have',
      color: colors.green
    },
    {
      title: 'Explicit Controllers',
      description: 'Must specify child controllers in parent\'s cgroup.subtree_control',
      color: colors.orange
    }
  ]}
/>

**Enable controllers for children:**
```bash
echo '+cpu +pids' > cgroup.subtree_control
```

**Root cgroup exception:** Can place processes in root cgroup to detach from systemd.

### 6.7. Viewing Resource Utilization

**What it is:** Monitoring accumulated resource usage across all processes in a cgroup.

**Why it matters:** See total resource consumption even if individual processes start and stop.

**View CPU usage:**
```bash
cat cpu.stat
```

**View memory usage** (requires memory controller):
```bash
cat memory.current  # Current usage
cat memory.stat      # Detailed statistics
```

:::info Controller Requirement
Some utilization files require the controller to be enabled. `cpu.stat` is always available.
:::

**Use cases:**
- Track service resource consumption over time
- Monitor containerized applications
- Aggregate statistics for process groups

## 7. Further Topics

### 7.1. Why So Many Monitoring Tools?

**Multiple resource types:** CPU, memory, disk I/O, network I/O each need specialized tools.

**Multiple consumers:** Processes, threads, kernel, and hardware all compete for resources.

**Historical context:** Different tools evolved to address specific monitoring needs.

### 7.2. Resource Limitation History

**Past:** Many users shared one machine. Fair resource allocation was critical.

**Present:**
- Single-user desktops still have many processes competing
- Servers handle massive concurrent request loads
- Resource monitoring remains essential

### 7.3. Advanced Topics to Explore

**sar (System Activity Reporter):**
- Continuous monitoring like `vmstat`
- Records historical data
- Analyze past system events

**Process accounting (acct):**
- Record all processes and their resource usage
- Useful for auditing and billing

**Quotas:**
- Limit disk space per user
- Prevent individual users from filling disks

**Performance analysis:**
- "Systems Performance: Enterprise and the Cloud" by Brendan Gregg
- Deep dive into tuning and optimization

### 7.4. Network Monitoring

**What's missing:** We haven't covered network resource monitoring tools.

**Why:** You need to understand networking first.

**Next chapter:** Network fundamentals and configuration.

## 8. Key Takeaways

<CardGrid
  title="Chapter Summary"
  cards={[
    {
      title: 'Process Monitoring',
      description: 'Use top, ps, lsof to track process activity',
      color: colors.blue
    },
    {
      title: 'Tracing',
      description: 'strace and ltrace reveal what programs are doing',
      color: colors.green
    },
    {
      title: 'Resource Metrics',
      description: 'CPU (load avg), memory (page faults), I/O (iostat)',
      color: colors.orange
    },
    {
      title: 'System-Wide Views',
      description: 'vmstat provides comprehensive performance overview',
      color: colors.purple
    },
    {
      title: 'Resource Control',
      description: 'cgroups enable sophisticated resource limiting',
      color: colors.red
    },
    {
      title: 'Focus on Understanding',
      description: 'Learn what tools measure, not premature optimization',
      color: colors.cyan
    }
  ]}
/>

The tools in this chapter reveal how the kernel manages the fundamental tension in computing: limited resources serving unlimited demands. Understanding these tools gives you insight into kernel behavior and helps you diagnose real problems when they arise.
