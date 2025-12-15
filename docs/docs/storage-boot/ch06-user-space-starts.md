---
sidebar_position: 3
title: "How User Space Starts"
description: "Master systemd and the user-space startup sequence: units, dependencies, services, and the transition from kernel to running system"
---

import { ProcessFlow, StackDiagram, CardGrid, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# 6. How User Space Starts

The moment the kernel executes init (PID 1), everything changes. User space is modular, customizable, and far more complex than the kernel's controlled boot sequence. This chapter reveals how modern Linux systems orchestrate the startup of hundreds of services.

## 6.1. Introduction to init

**In plain English:** init is the first program the kernel runs - it's the parent of all other processes and manages system services.

**In technical terms:** init is a user-space program (typically systemd) with PID 1, responsible for starting and stopping essential services, managing dependencies, and supervising the system lifecycle.

**Why it matters:** Understanding init is crucial because it controls everything from hardware initialization to application startup, making it the foundation of a functioning Linux system.

<ProcessFlow
  title="User Space Startup Order"
  steps={[
    { label: "init (systemd)", color: colors.blue },
    { title: "Essential services (udevd, syslogd)", color: colors.green },
    { label: "Network configuration", color: colors.yellow },
    { title: "Mid/high-level services (cron, printing)", color: colors.orange },
    { title: "Login prompts, GUIs, applications", color: colors.red }
  ]}
/>

**Modern init implementations:**

<CardGrid cards={[
  {
    title: "systemd",
    description: "Current standard on major distributions. Parallel startup, service tracking, unified logging. Default since Ubuntu 15.04, RHEL 7.",
    color: colors.blue
  },
  {
    title: "System V init",
    description: "Traditional sequential init. Simple scripts, predictable order, but slow. Legacy systems only (pre-RHEL 7, pre-Debian 8).",
    color: colors.green
  },
  {
    title: "Upstart",
    description: "Event-based init, used by Ubuntu before 15.04. Largely replaced by systemd.",
    color: colors.yellow
  }
]} />

### 6.1.1. Problems with Traditional Init

**In plain English:** Old-style init was like assembling a car one part at a time - slow and inflexible.

**In technical terms:** System V init executed startup scripts sequentially, preventing parallel initialization and lacking dynamic service management capabilities.

**Why it matters:** Understanding traditional init's limitations explains why systemd exists and why it works the way it does.

**Key limitations:**

1. **Performance**: Sequential script execution (one at a time)
2. **Service tracking**: No visibility into running service PIDs or states
3. **Boilerplate**: Repetitive script code for common operations
4. **Static configuration**: Services start at boot, no on-demand activation

## 6.2. Identifying Your init

**In plain English:** You need to know which init system your distribution uses to understand how services are managed.

**In technical terms:** Different init systems use distinct directory structures and configuration formats, making identification straightforward.

**Why it matters:** Commands and configuration vary dramatically between init systems.

**Identification methods:**

```bash
# Check for systemd directories
ls /usr/lib/systemd /etc/systemd

# Check for System V init
ls /etc/inittab

# View init manual page
man init
```

<TreeDiagram
  title="Init Detection Decision Tree"
  root={{
    label: "Check system",
    color: colors.blue,
    children: [
      {
        label: "/usr/lib/systemd exists?",
        color: colors.green,
        children: [
          { label: "Yes → systemd", color: colors.purple }
        ]
      },
      {
        label: "/etc/init/*.conf exists?",
        color: colors.orange,
        children: [
          { label: "Yes → Upstart (legacy)", color: colors.slate }
        ]
      },
      {
        label: "/etc/inittab exists?",
        color: colors.cyan,
        children: [
          { label: "Yes → System V init (legacy)", color: colors.slate }
        ]
      }
    ]
  }}
/>

## 6.3. systemd

**In plain English:** systemd is like an orchestra conductor - it starts services when needed, manages dependencies, and keeps everything synchronized.

**In technical terms:** systemd is a goal-oriented init system using units (declarative service definitions) with dependency graphs, parallel activation, and integrated service supervision.

**Why it matters:** systemd's architecture enables fast boot times, sophisticated dependency management, and powerful service tracking unavailable in traditional init systems.

### 6.3.1. Units and Unit Types

**In plain English:** Units are like LEGO blocks - different types (services, devices, mounts) that systemd assembles into a working system.

**In technical terms:** A unit is systemd's abstraction for system resources. Each unit has a type (service, target, socket, mount, etc.) and a configuration file defining its behavior.

**Why it matters:** The unit abstraction allows systemd to manage not just services but filesystems, devices, timers, and network connections uniformly.

<CardGrid cards={[
  {
    title: "Service Units",
    description: "Control service daemons. Most common type. Examples: sshd.service, nginx.service, postgresql.service.",
    color: colors.blue
  },
  {
    title: "Target Units",
    description: "Group other units together. Like System V runlevels but more flexible. Examples: multi-user.target, graphical.target.",
    color: colors.green
  },
  {
    title: "Socket Units",
    description: "Represent network or IPC sockets. Enable on-demand service activation. Examples: dbus.socket, sshd.socket.",
    color: colors.yellow
  },
  {
    title: "Mount Units",
    description: "Control filesystem mount points. Often generated from /etc/fstab. Examples: home.mount, tmp.mount.",
    color: colors.orange
  }
]} />

### 6.3.2. Booting and Unit Dependency Graphs

**In plain English:** When you boot, systemd doesn't follow a linear list - it activates a web of interconnected units based on dependencies.

**In technical terms:** systemd constructs a directed acyclic graph (DAG) of unit dependencies, activating units in parallel wherever possible while respecting ordering constraints.

**Why it matters:** Dependency graphs enable parallel startup (reducing boot time) while ensuring services start in valid orders (network before NFS mounts).

<ProcessFlow
  steps={[
    { title: 'default.target', description: 'System goal', color: colors.blue },
    { title: 'graphical.target', description: 'Desktop/GUI', color: colors.green },
    { title: 'multi-user.target', description: 'Multi-user mode', color: colors.yellow },
    { title: 'basic.target', description: 'Basic services', color: colors.orange }
  ]}
/>

**Key targets:**
- **default.target** - Symlink to graphical.target or multi-user.target
- **graphical.target** - Full desktop with display manager
- **multi-user.target** - Text-mode, network-enabled
- **basic.target** - Minimal services ready

**Viewing dependencies:**

```bash
# Generate complete dependency graph (large!)
systemd-analyze dot | dot -Tsvg > dependencies.svg

# View specific unit dependencies
systemctl list-dependencies default.target
```

### 6.3.3. systemd Configuration

**In plain English:** systemd configuration lives in two places - system defaults that distributions manage, and local overrides you control.

**In technical terms:** Unit files reside in system directories (/usr/lib/systemd/system) and override directories (/etc/systemd/system), with the latter taking precedence.

**Why it matters:** This separation prevents distribution updates from overwriting your customizations.

**Configuration hierarchy:**

```
/etc/systemd/system/          # Local overrides (highest priority)
/run/systemd/system/          # Runtime units
/usr/lib/systemd/system/      # Distribution defaults
```

<StackDiagram
  title="systemd Configuration Priority"
  layers={[
    { label: "/etc/systemd/system/ (Your overrides)", color: colors.blue },
    { label: "/run/systemd/system/ (Runtime)", color: colors.green },
    { label: "/usr/lib/systemd/system/ (Distribution)", color: colors.yellow }
  ]}
/>

**Viewing configuration paths:**

```bash
# Show search path with precedence order
systemctl -p UnitPath show

# Find system unit directory
pkg-config systemd --variable=systemdsystemunitdir

# Find system configuration directory
pkg-config systemd --variable=systemdsystemconfdir
```

### 6.3.4. Unit File Format

**In plain English:** Unit files look like Windows .ini files - sections in brackets with key=value settings.

**In technical terms:** Unit files use INI-style syntax with sections ([Unit], [Service], [Install]) and variable assignments following Desktop Entry Specification format.

**Why it matters:** Understanding unit file syntax allows you to create custom services and modify existing ones.

**Example service unit (dbus-daemon.service):**

```ini
[Unit]
Description=D-Bus System Message Bus
Documentation=man:dbus-daemon(1)
Requires=dbus.socket
RefuseManualStart=yes

[Service]
ExecStart=/usr/bin/dbus-daemon --system --address=systemd: --nofork
ExecReload=/usr/bin/dbus-send --print-reply --system --type=method_call --dest=org.freedesktop.DBus / org.freedesktop.DBus.ReloadConfig
```

**Section breakdown:**

<CardGrid cards={[
  {
    title: "[Unit]",
    description: "Metadata and dependencies. Description, documentation, Requires/Wants/After dependencies.",
    color: colors.blue
  },
  {
    title: "[Service]",
    description: "Service-specific settings. ExecStart (command), ExecReload (reload command), Type (startup behavior).",
    color: colors.green
  },
  {
    title: "[Install]",
    description: "Installation information. WantedBy/RequiredBy (reverse dependencies), enables systemctl enable/disable.",
    color: colors.yellow
  }
]} />

**Variables and specifiers:**

```ini
[Service]
# Environment variables from file
EnvironmentFile=/etc/sysconfig/sshd
ExecStart=/usr/sbin/sshd -D $OPTIONS

# systemd-provided variables
ExecReload=/bin/kill -HUP $MAINPID

# Specifiers (template variables)
# %n = unit name, %H = hostname, %i = instance name
Description=Getty on %n
```

### 6.3.5. systemd Operation

**In plain English:** You control systemd with the `systemctl` command - start/stop services, check status, and view logs.

**In technical terms:** systemctl is the primary interface to systemd, providing commands for unit activation, status queries, and configuration management.

**Why it matters:** These commands are essential for daily system administration and troubleshooting.

**Essential commands:**

```bash
# List active units (default command)
systemctl list-units
systemctl    # Same as above

# Show all units including inactive
systemctl list-units --all

# Check service status (very informative!)
systemctl status sshd.service

# Start/stop/restart services
systemctl start sshd.service
systemctl stop sshd.service
systemctl restart sshd.service

# Reload configuration without restart
systemctl reload sshd.service

# Enable/disable auto-start at boot
systemctl enable sshd.service
systemctl disable sshd.service
```

**Status output example:**

```
● sshd.service - OpenBSD Secure Shell server
   Loaded: loaded (/usr/lib/systemd/system/sshd.service; enabled)
   Active: active (running) since Fri 2021-04-16 08:15:41 EDT; 1 month ago
 Main PID: 1110 (sshd)
    Tasks: 1 (limit: 4915)
   CGroup: /system.slice/sshd.service
           └─1110 /usr/sbin/sshd -D

Apr 16 08:15:41 hostname systemd[1]: Started OpenBSD Secure Shell server.
```

<ProcessFlow
  title="Service Lifecycle Commands"
  steps={[
    { label: "systemctl start → Running", color: colors.green },
    { label: "systemctl stop → Stopped", color: colors.red },
    { label: "systemctl restart → Stop then Start", color: colors.yellow },
    { label: "systemctl reload → Reload config only", color: colors.blue }
  ]}
/>

**Viewing logs:**

```bash
# View service logs
journalctl --unit=sshd.service

# Follow logs in real-time
journalctl -u sshd.service -f

# Logs from current boot
journalctl -b

# Logs from previous boot
journalctl -b -1
```

### 6.3.6. Jobs and Unit State Changes

**In plain English:** When you start or stop a service, systemd creates a "job" to perform that action.

**In technical terms:** Jobs are temporary systemd operations representing unit state changes. They track activation, deactivation, and reload requests, with dependencies creating job chains.

**Why it matters:** Understanding jobs helps diagnose why services take time to start or why some services wait for others.

```bash
# View active jobs
systemctl list-jobs
```

**Job states during slow boot:**

```
JOB  UNIT                      TYPE   STATE
  1  graphical.target          start  waiting
  2  multi-user.target         start  waiting
 76  sendmail.service          start  running
120  systemd-read-done.timer   start  waiting
```

Here, jobs 1, 2, and 120 wait for job 76 (sendmail) to complete.

### 6.3.7. Adding Units to systemd

**In plain English:** To add a custom service, create a unit file in /etc/systemd/system, then enable and start it.

**In technical terms:** User-created unit files in /etc/systemd/system override distribution units, with systemctl enable creating symlinks in dependency directories.

**Why it matters:** Custom units allow you to manage your own services with systemd's powerful dependency and supervision features.

**Example: Creating simple target units**

```bash
# Create test1.target
cat > /etc/systemd/system/test1.target <<EOF
[Unit]
Description=test 1
EOF

# Create test2.target with dependency
cat > /etc/systemd/system/test2.target <<EOF
[Unit]
Description=test 2
Wants=test1.target
EOF

# Activate test2 (automatically activates test1)
systemctl start test2.target

# Check status of both
systemctl status test1.target test2.target
```

**Units with [Install] sections:**

```bash
# Enable creates symlinks based on WantedBy/RequiredBy
systemctl enable myservice.service

# Now starts at boot
systemctl reboot
```

### 6.3.8. systemd Dependencies

**In plain English:** Dependencies control when services start relative to each other and what happens when services fail.

**In technical terms:** systemd provides multiple dependency types (Requires, Wants, Requisite, Conflicts) and ordering modifiers (Before, After) to construct flexible, fault-tolerant startup sequences.

**Why it matters:** Proper dependencies prevent boot failures from cascading and allow non-critical services to fail gracefully.

<CardGrid cards={[
  {
    title: "Requires (Strict)",
    description: "If dependency fails, this unit fails. Use sparingly - can cause cascading failures during boot.",
    color: colors.red
  },
  {
    title: "Wants (Soft)",
    description: "Preferred dependency type. Starts dependency but doesn't care if it fails. Provides robustness.",
    color: colors.green
  },
  {
    title: "Requisite",
    description: "Dependency must already be active. Doesn't start it. Checks prerequisite before activation.",
    color: colors.yellow
  },
  {
    title: "Conflicts",
    description: "Negative dependency. Stops conflicting unit when activating this one. Mutual exclusion.",
    color: colors.purple
  }
]} />

**Ordering modifiers:**

```ini
[Unit]
# This unit starts AFTER network.target
After=network.target

# This unit starts BEFORE graphical.target
Before=graphical.target
```

:::info Dependency vs Ordering
Dependencies control **what** starts together. Ordering controls **when** (sequence).

Example: `Wants=network.target After=network.target`
- Wants: Start network.target if not started
- After: Wait for network.target to finish before starting this unit
:::

**Viewing dependencies:**

```bash
# Show Wants dependencies
systemctl show -p Wants multi-user.target

# Show Requires dependencies
systemctl show -p Requires multi-user.target
```

### 6.3.9. The [Install] Section and Enabling Units

**In plain English:** The [Install] section lets dependencies point "backward" - dependent units declare which targets should want them.

**In technical terms:** WantedBy and RequiredBy directives create reverse dependencies, with systemctl enable generating symbolic links in .wants/.requires directories.

**Why it matters:** Reverse dependencies allow self-contained unit files that declare their own activation conditions without modifying system targets.

**Example:**

```ini
# myservice.service
[Unit]
Description=My Custom Service

[Service]
ExecStart=/usr/local/bin/myapp

[Install]
WantedBy=multi-user.target
```

**Enabling the service:**

```bash
systemctl enable myservice.service
# Creates: /etc/systemd/system/multi-user.target.wants/myservice.service
#          → /etc/systemd/system/myservice.service
```

<ProcessFlow
  title="systemctl enable Operation"
  steps={[
    { label: "Read [Install] section", color: colors.blue },
    { label: "Parse WantedBy=multi-user.target", color: colors.green },
    { label: "Create .wants directory if needed", color: colors.yellow },
    { label: "Create symlink in multi-user.target.wants/", color: colors.orange },
    { label: "Now starts when multi-user.target starts", color: colors.red }
  ]}
/>

**Disabling:**

```bash
systemctl disable myservice.service
# Removes symlink from multi-user.target.wants/
```

:::warning Enable vs Start
- **enable**: Create symlinks for boot-time startup
- **start**: Activate unit immediately

Neither implies the other!
:::

### 6.3.10. systemd Process Tracking and Synchronization

**In plain English:** systemd uses control groups (cgroups) to track every process belonging to a service, even if they fork or daemonize.

**In technical terms:** systemd leverages kernel cgroups to maintain a hierarchical process tree, allowing accurate service supervision without PID file management.

**Why it matters:** Unlike traditional init, systemd knows exactly which processes belong to which services, enabling reliable restarts and resource management.

**Service types:**

<CardGrid cards={[
  {
    title: "Type=simple",
    description: "Process doesn't fork. ExecStart is main process. Default and most common.",
    color: colors.blue
  },
  {
    title: "Type=forking",
    description: "Process forks and parent exits. Traditional daemon behavior. systemd expects fork.",
    color: colors.green
  },
  {
    title: "Type=notify",
    description: "Process signals readiness via systemd API. Accurate startup synchronization.",
    color: colors.yellow
  },
  {
    title: "Type=oneshot",
    description: "Process runs to completion. Used for initialization scripts. RemainAfterExit=yes common.",
    color: colors.orange
  }
]} />

**Viewing process hierarchy:**

```bash
# Show systemd control groups
systemd-cgls

# Show processes for specific service
systemctl status sshd.service
```

### 6.3.11. systemd On-Demand and Resource-Parallelized Startup

**In plain English:** systemd can delay starting services until they're needed, or start multiple services simultaneously by providing their resources immediately.

**In technical terms:** Socket activation and path units enable lazy service initialization, while resource units allow parallel startup by providing interfaces before services are ready.

**Why it matters:** On-demand startup reduces boot time and memory usage. Parallel startup with resource units dramatically improves boot performance.

**Socket activation example:**

<ProcessFlow
  steps={[
    { title: 'Client Connects', description: 'To port 22222', color: colors.blue },
    { title: 'Socket Activates', description: 'systemd notices', color: colors.green },
    { title: 'Service Starts', description: 'echo@.service', color: colors.orange },
    { title: 'Handoff', description: 'Socket passed to service', color: colors.red }
  ]}
/>

**Echo service example:**

```ini
# echo.socket
[Socket]
ListenStream=22222
Accept=true

# echo@.service (@ = supports instances)
[Service]
ExecStart=/bin/cat
StandardInput=socket
```

**Activation:**

```bash
# Start socket (service starts on-demand)
systemctl start echo.socket

# Test with telnet
telnet localhost 22222
```

**Boot optimization with resource units:**

<ProcessFlow
  title="Parallel Boot with Socket Units"
  steps={[
    { label: "systemd starts journald.socket immediately", color: colors.blue },
    { label: "Dependent services start in parallel", color: colors.green },
    { label: "journald.service starts when ready", color: colors.yellow },
    { label: "journald takes over socket", color: colors.orange },
    { label: "All services already running", color: colors.red }
  ]}
/>

### 6.3.12. systemd Auxiliary Components

**In plain English:** systemd includes more than just init - it provides logging, device management, and DNS caching too.

**In technical terms:** systemd comprises multiple integrated daemons: systemd-udevd (device management), systemd-journald (logging), systemd-resolved (DNS), and others.

**Why it matters:** Understanding that "systemd" is a suite of components explains the proliferation of systemd-\* executables.

<CardGrid cards={[
  {
    title: "systemd-udevd",
    description: "Device manager. Handles hotplug events, creates device nodes, loads drivers. Covered in Chapter 3.",
    color: colors.blue
  },
  {
    title: "systemd-journald",
    description: "Logging service. Binary log format with indexing. Replaces traditional syslog. Covered in Chapter 7.",
    color: colors.green
  },
  {
    title: "systemd-resolved",
    description: "DNS resolver with caching. Provides name resolution for applications. Covered in Chapter 9.",
    color: colors.yellow
  },
  {
    title: "systemd-networkd",
    description: "Network configuration daemon. Alternative to NetworkManager for simple setups.",
    color: colors.orange
  }
]} />

## 6.4. System V Runlevels

**In plain English:** Runlevels are numbered system states (0-6) representing different modes like shutdown, single-user, or graphical.

**In technical terms:** Runlevels define sets of running services, with init transitioning between levels by starting or stopping services based on runlevel directories.

**Why it matters:** While obsolete with systemd (which uses targets instead), runlevels still appear in legacy systems and compatibility modes.

**Traditional runlevels:**

```
0 - Halt (shutdown)
1 - Single-user mode (root only, maintenance)
2-4 - Multi-user mode (text console, varies by distribution)
5 - Graphical mode (X11/GUI)
6 - Reboot
```

**Checking runlevel:**

```bash
# Current runlevel
who -r
# Output: run-level 5  2019-01-27 16:43
```

**systemd compatibility:**

systemd provides runlevel targets for compatibility:

```
runlevel0.target → poweroff.target
runlevel1.target → rescue.target
runlevel3.target → multi-user.target
runlevel5.target → graphical.target
runlevel6.target → reboot.target
```

## 6.5. System V init

**In plain English:** System V init is the traditional init system - simple scripts running in sequence from configuration files.

**In technical terms:** System V init uses /etc/inittab to define startup behavior, executing scripts from /etc/rc.d/rc\*.d/ directories in numeric order per runlevel.

**Why it matters:** Understanding System V init helps with legacy systems and explains why systemd was developed.

**Core configuration: /etc/inittab**

```
# Set default runlevel
id:5:initdefault:

# Run script when entering runlevel 5
l5:5:wait:/etc/rc.d/rc 5

# Respawn login prompts
1:2345:respawn:/sbin/mingetty tty1

# Handle Ctrl-Alt-Del
ca::ctrlaltdel:/sbin/shutdown -t3 -r now
```

**Field format:**

```
id:runlevels:action:command
```

### 6.5.1. System V init: Startup Command Sequence

**In plain English:** System V init runs numbered scripts in order: S10, S20, S30, etc., with lower numbers starting first.

**In technical terms:** The rc script executes symlinks in /etc/rc\*.d/ directories sequentially, passing "start" or "stop" arguments based on the S or K prefix.

**Why it matters:** This sequential execution is simple but slow - every service waits for the previous one to complete.

**Runlevel directory structure:**

```
/etc/rc5.d/
  S10sysklogd -> ../init.d/sysklogd
  S20acct -> ../init.d/acct
  S99sshd -> ../init.d/sshd
  K20nfs -> ../init.d/nfs
```

<ProcessFlow
  title="System V Startup Sequence"
  steps={[
    { label: "S10sysklogd start (system logger)", color: colors.blue },
    { label: "S20acct start (process accounting)", color: colors.green },
    { label: "... (more services sequentially)", color: colors.yellow },
    { label: "S99sshd start (SSH server)", color: colors.orange },
    { label: "Boot complete", color: colors.red }
  ]}
/>

### 6.5.2. The System V init Link Farm

**In plain English:** Runlevel directories contain symbolic links to actual scripts in /etc/init.d, allowing the same script to be used in multiple runlevels.

**In technical terms:** A link farm structure where /etc/rc\*.d/ directories contain symlinks to /etc/init.d/ scripts, with link names encoding execution order and action.

**Why it matters:** Understanding the link farm explains how to modify the boot sequence and control which services start in each runlevel.

**Managing services manually:**

```bash
# Start service directly
/etc/init.d/sshd start

# Stop service
/etc/init.d/sshd stop

# Restart service
/etc/init.d/sshd restart

# Check status
/etc/init.d/sshd status
```

**Modifying boot sequence:**

```bash
# Disable service (rename link to prevent execution)
mv /etc/rc5.d/S99httpd /etc/rc5.d/_S99httpd

# Add service (create link with appropriate number)
ln -s /etc/init.d/myservice /etc/rc5.d/S95myservice
```

### 6.5.3. systemd System V Compatibility

**In plain English:** systemd can run old System V init scripts to provide backward compatibility.

**In technical terms:** systemd wraps System V scripts in automatically generated service units, executing them sequentially while tracking them as systemd services.

**Why it matters:** Legacy services without native systemd units can still function, though without full systemd benefits.

**Compatibility mechanism:**

<ProcessFlow
  title="System V Compatibility in systemd"
  steps={[
    { label: "systemd activates runlevel5.target", color: colors.blue },
    { label: "Scans /etc/rc5.d/ for links", color: colors.green },
    { label: "Associates /etc/init.d/foo with foo.service", color: colors.yellow },
    { label: "Runs script with start/stop argument", color: colors.orange },
    { label: "Tracks processes as systemd service", color: colors.red }
  ]}
/>

## 6.6. Shutting Down Your System

**In plain English:** Always use the shutdown command to turn off your computer - it ensures data is saved and services stop cleanly.

**In technical terms:** The shutdown command notifies init to terminate services gracefully, sync filesystem buffers, unmount filesystems, and invoke the kernel reboot/halt system call.

**Why it matters:** Improper shutdown (power button, reset) can corrupt filesystems and lose data because of unwritten disk caches.

**Shutdown commands:**

```bash
# Halt immediately
shutdown -h now

# Reboot immediately
shutdown -r now

# Reboot in 10 minutes
shutdown -r +10

# Halt at specific time
shutdown -h 23:00
```

<ProcessFlow
  title="Shutdown Process"
  steps={[
    { label: "shutdown command creates /etc/nologin", color: colors.blue },
    { label: "init sends TERM signal to all processes", color: colors.green },
    { title: "init waits, then sends KILL to stragglers", color: colors.yellow },
    { label: "Sync filesystems and unmount", color: colors.orange },
    { label: "Remount root read-only", color: colors.red },
    { label: "Kernel reboot/halt system call", color: colors.purple }
  ]}
/>

**Direct commands (skip shutdown timer):**

```bash
# Immediate reboot (dangerous if filesystem active)
reboot

# Immediate halt
halt

# Immediate poweroff
poweroff

# Force immediate shutdown (DANGEROUS!)
reboot -f
```

:::danger Force Shutdown Warning
`reboot -f` and `halt -f` bypass normal shutdown procedures. Use only in emergencies when the system is already broken - otherwise risk data loss!
:::

## 6.7. The Initial RAM Filesystem

**In plain English:** The initial RAM filesystem (initramfs) is a mini root filesystem that loads before the real one, providing drivers needed to access the actual root.

**In technical terms:** initramfs is a cpio archive loaded by the boot loader into memory, containing kernel modules, minimal utilities, and init scripts to mount the real root filesystem.

**Why it matters:** Modern systems need initramfs because distributions can't include all storage drivers in the kernel - they're loaded on-demand from the initramfs.

### 6.7.1. The Problem initramfs Solves

**The driver paradox:**

<ConnectionDiagram
  title="The Initramfs Problem"
  nodes={[
    { id: 'kernel', label: 'Kernel\n(No storage drivers)', color: colors.red },
    { id: 'root', label: 'Root Filesystem\n(Needs drivers)', color: colors.yellow },
    { id: 'modules', label: 'Driver Modules\n(On root filesystem)', color: colors.orange }
  ]}
  connections={[
    { from: 'kernel', to: 'root', label: 'Can\'t mount' },
    { from: 'root', to: 'modules', label: 'Contains' },
    { from: 'modules', to: 'kernel', label: 'Needed by' }
  ]}
/>

**Solution: initramfs**

1. Boot loader loads kernel AND initramfs into memory
2. Kernel mounts initramfs as temporary root
3. Kernel runs /init from initramfs
4. init loads necessary driver modules
5. init mounts real root filesystem
6. init pivots to real root and executes real init

<StackDiagram
  title="Boot Sequence with Initramfs"
  layers={[
    { label: "Real init (systemd on actual root)", color: colors.blue },
    { label: "Real root filesystem mounted", color: colors.green },
    { label: "Storage drivers loaded", color: colors.yellow },
    { label: "initramfs init executes", color: colors.orange },
    { label: "initramfs mounted as /", color: colors.red },
    { label: "Kernel + initramfs loaded", color: colors.purple },
    { label: "Boot loader (GRUB)", color: colors.pink }
  ]}
/>

### 6.7.2. Inspecting initramfs

**In plain English:** You can unpack and examine the initramfs to see what's inside - drivers, scripts, and a mini filesystem.

**In technical terms:** initramfs is typically a compressed cpio archive, extractable with unmkinitramfs or manual cpio commands.

**Why it matters:** Understanding initramfs contents helps diagnose boot problems related to missing drivers or broken initialization scripts.

```bash
# Extract initramfs (varies by distribution)
unmkinitramfs /boot/initrd.img-$(uname -r) /tmp/initramfs

# Or manually
zcat /boot/initrd.img-$(uname -r) | cpio -idmv
```

**Typical contents:**

- Kernel modules (drivers for storage, filesystems, LVM)
- Basic utilities (mount, modprobe, udevd)
- Init script (shell script or mini systemd)
- Device nodes and basic /dev structure

### 6.7.3. Creating initramfs

**In plain English:** Distributions provide tools to build initramfs images automatically based on your system's hardware.

**In technical terms:** Utilities like mkinitramfs and dracut analyze system configuration, determine required modules, and generate customized initramfs archives.

**Why it matters:** You'll need to rebuild initramfs after kernel module changes or when adding support for new hardware.

```bash
# Ubuntu/Debian
update-initramfs -u

# Red Hat/Fedora/CentOS
dracut --force

# Manually
mkinitramfs -o /boot/initrd.img-$(uname -r)
```

:::info When to Rebuild
Rebuild initramfs when:
- Installing new kernel
- Adding hardware requiring specific modules
- Modifying /etc/crypttab (encrypted disks)
- Changing LVM configuration
- Fixing boot problems related to missing drivers
:::

## 6.8. Emergency Booting and Single-User Mode

**In plain English:** When your system won't boot normally, you can start in single-user mode (minimal environment) or use a live USB for repairs.

**In technical terms:** Single-user mode boots directly to a root shell with minimal services, skipping normal init sequences. Live images provide complete rescue environments from removable media.

**Why it matters:** These recovery modes are essential for fixing filesystem corruption, resetting passwords, and repairing broken configurations.

**Common recovery tasks:**

<CardGrid cards={[
  {
    title: "Filesystem Repair",
    description: "Run fsck on unmounted filesystems to fix corruption from crashes or improper shutdowns.",
    color: colors.red
  },
  {
    title: "Password Reset",
    description: "Mount root filesystem and edit /etc/shadow or use passwd command to reset forgotten passwords.",
    color: colors.yellow
  },
  {
    title: "Fix /etc/fstab",
    description: "Repair broken filesystem mount configurations preventing normal boot.",
    color: colors.green
  },
  {
    title: "Restore Backups",
    description: "Mount backup media and restore critical system files or data.",
    color: colors.blue
  }
]} />

**Entering single-user mode:**

1. At GRUB menu, press 'e' to edit boot entry
2. Find line starting with 'linux'
3. Append `-s` or `single` to kernel parameters
4. Press Ctrl-X or F10 to boot

**systemd rescue mode:**

```bash
# Boot to rescue.target (single-user equivalent)
systemctl rescue

# Or add to kernel parameters:
systemd.unit=rescue.target
```

**Live image advantages:**

- Full GUI and tools available
- Can mount and access all filesystems
- Networking available for downloading tools
- No risk of further damage to installed system

:::tip Modern Recovery
Most modern distributions' installation media double as live images. Keep a USB drive with your distribution's installer for emergency recovery.
:::

## 6.9. Looking Forward

**In plain English:** You now understand the complete journey from powered-off computer to running system with all services active.

**In technical terms:** The boot process spans firmware initialization, boot loader execution, kernel loading and device discovery, and finally user-space service orchestration via init.

**Why it matters:** This knowledge is fundamental for system administration, troubleshooting, and understanding how all Linux components fit together.

**What you've learned:**

<ProcessFlow
  title="Complete Boot Chain"
  steps={[
    { label: "Firmware (BIOS/UEFI)", color: colors.blue },
    { label: "Boot Loader (GRUB)", color: colors.green },
    { label: "Kernel Initialization", color: colors.yellow },
    { label: "initramfs (driver loading)", color: colors.orange },
    { label: "Root Filesystem Mount", color: colors.red },
    { label: "init (systemd) Startup", color: colors.purple },
    { label: "Service Activation", color: colors.pink },
    { label: "Running System", color: colors.blue }
  ]}
/>

**Next chapters explore:**

- **Chapter 7**: System configuration (logging, time, users, batch jobs)
- **Chapter 8**: Process management and memory
- **Chapter 9**: Networking fundamentals
- **Chapter 10**: Network applications and services

---

## Summary

You've mastered the user-space startup sequence:

1. **init (systemd)**: First user process (PID 1), orchestrates everything
2. **Units**: Service, target, socket, mount - modular system components
3. **Dependencies**: Wants, Requires, After, Before - flexible startup ordering
4. **Service Management**: systemctl for start/stop/enable/status
5. **initramfs**: Temporary root for loading storage drivers
6. **Recovery**: Single-user mode and live images for repairs

**Key takeaways:**

- systemd uses dependency graphs for parallel startup
- Units are declarative - describe desired state, not how to achieve it
- cgroups enable accurate process tracking without PID files
- Socket activation allows on-demand service starting
- initramfs solves the "driver chicken-and-egg" problem
- Proper shutdown is critical to prevent data loss

**Next**: Chapter 7 covers essential system services that init starts: logging, time synchronization, scheduling, and user management.
