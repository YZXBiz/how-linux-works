---
sidebar_position: 1
title: "System Configuration: Logging, System Time, Batch Jobs, and Users"
description: "Master Linux system configuration including logging with journald, user management, time synchronization, and task scheduling with cron and systemd timers."
---

import { ProcessFlow, StackDiagram, CardGrid, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# System Configuration: Logging, System Time, Batch Jobs, and Users

When you first explore `/etc`, you might feel overwhelmed by the sheer number of configuration files. The good news: only a handful are truly fundamental.

This chapter covers the infrastructure that makes Linux usable. We'll explore system logging, configuration files, key daemons, time management, and task scheduling. These components bridge the kernel space covered in Chapter 4 with the user-space tools from Chapter 2.

## 1. System Logging

### 1.1. Understanding System Logging

**What it is:** System logging is the process of recording diagnostic messages from programs and the kernel to help troubleshoot problems.

**Why it matters:** When something goes wrong and you don't know where to start, logs are your first stop. They provide a chronological record of what happened on your system.

**How it works:** Most programs send messages to a logging service (journald on modern systems, or syslogd on older systems). The logging service receives, categorizes, and stores these messages for later retrieval.

<ProcessFlow
  title="System Logging Flow"
  steps={[
    { title: 'Application', description: 'Generates diagnostic message', color: colors.blue },
    { title: 'Socket', description: '/dev/log receives message', color: colors.gray },
    { title: 'journald', description: 'Processes and categorizes', color: colors.green },
    { title: 'Storage', description: '/var/log/journal stores logs', color: colors.purple }
  ]}
/>

A typical log message contains:
- **Timestamp**: When the event occurred
- **Hostname**: Which machine generated it
- **Process name**: What program sent it
- **Process ID (PID)**: The specific instance
- **Message**: The actual diagnostic information

Example log message:
```
Aug 19 17:59:48 duplex sshd[484]: Server listening on 0.0.0.0 port 22.
```

:::info Logging Evolution
Modern distributions use journald (part of systemd) for logging. Older systems used syslogd or rsyslogd. Some distributions run both simultaneously for compatibility.
:::

### 1.2. Checking Your Log Setup

**What it is:** Identifying which logging system your machine uses.

**Why it matters:** Different logging systems use different commands and configuration files. You need to know which one you have.

**How to check:**

1. **Check for journald** (most modern systems):
```bash
journalctl
```
If you see a paged list of log messages, you have journald.

2. **Check for rsyslogd**:
```bash
ps aux | grep rsyslogd
ls /etc/rsyslog.conf
```

3. **Check for syslog-ng**:
```bash
ls -d /etc/syslog-ng
```

4. **Examine /var/log**:
```bash
ls -la /var/log
```

<CardGrid
  title="Log Storage Locations"
  cards={[
    {
      title: '/var/log/journal',
      description: 'journald binary logs (modern systems)',
      color: colors.green
    },
    {
      title: '/var/log/syslog',
      description: 'rsyslogd text logs (older systems)',
      color: colors.blue
    },
    {
      title: '/var/log/messages',
      description: 'General system messages',
      color: colors.orange
    },
    {
      title: '/var/log/auth.log',
      description: 'Authentication and authorization logs',
      color: colors.red
    }
  ]}
/>

:::warning File Permissions
To access all journal messages, run `journalctl` as root or ensure your user is in the `adm` or `systemd-journal` groups.
:::

### 1.3. Searching and Monitoring Logs

#### 1.3.1. Basic journalctl Usage

**What it is:** `journalctl` is the primary tool for querying systemd's journal.

**Why it matters:** Logs contain thousands of messages. Effective filtering helps you find problems quickly.

**How it works:** journalctl accepts various filtering options to narrow down results by time, unit, field, or content.

**Viewing all logs** (paged output):
```bash
journalctl
```

**Reverse chronological order** (newest first):
```bash
journalctl -r
```

#### 1.3.2. Filtering by Time

**What it is:** Limiting log output to a specific time range.

**Why it matters:** Problems often occur at specific times. Time filtering helps you zoom in on relevant events.

**How to filter:**

Show logs from the past 4 hours:
```bash
journalctl -S -4h
```

Show logs since 6:00 AM today:
```bash
journalctl -S 06:00:00
```

Show logs from a specific date:
```bash
journalctl -S 2020-01-14
```

Show logs from a specific date and time:
```bash
journalctl -S '2020-01-14 14:30:00'
```

Show logs until a specific time (less common):
```bash
journalctl -U '2020-01-14 18:00:00'
```

#### 1.3.3. Filtering by Unit

**What it is:** Showing only logs from a specific systemd service.

**Why it matters:** When troubleshooting a service, you only care about that service's logs.

**How to filter:**

View logs for the cron service:
```bash
journalctl -u cron.service
```

You can omit the `.service` suffix:
```bash
journalctl -u cron
```

List all units that have logged messages:
```bash
journalctl -F _SYSTEMD_UNIT
```

#### 1.3.4. Filtering by Text

**What it is:** Searching log messages for specific patterns using regular expressions.

**Why it matters:** Sometimes you know what error message you're looking for, but not when it occurred.

**How to search:**

Search for messages containing "kernel" followed by "memory":
```bash
journalctl -g 'kernel.*memory'
```

:::info Note
The `-g` option requires specific library support. Not all distributions include it.
:::

After finding a match, use the timestamp to see surrounding context:
```bash
journalctl -S '2020-01-14 14:29:50'
```

#### 1.3.5. Filtering by Boot

**What it is:** Viewing logs from specific boot sessions.

**Why it matters:** Problems often occur during startup or shutdown. Boot filtering isolates these events.

**How to filter:**

Show logs from current boot:
```bash
journalctl -b
```

Show logs from previous boot:
```bash
journalctl -b -1
```

Check if last shutdown was clean (newest messages first):
```bash
journalctl -r -b -1
```

Clean shutdown output shows:
```
-- Logs begin at Wed 2019-04-03 12:29:31 EDT, end at Fri 2019-08-02 19:10:14 EDT. --
Jul 18 12:19:52 mymachine systemd-journald[602]: Journal stopped
Jul 18 12:19:52 mymachine systemd-shutdown[1]: Sending SIGTERM to remaining processes...
Jul 18 12:19:51 mymachine systemd-shutdown[1]: Syncing filesystems and block devices.
```

List all available boots:
```bash
journalctl --list-boots
```

Show kernel messages (optionally from specific boot):
```bash
journalctl -k
journalctl -k -b -1
```

#### 1.3.6. Filtering by Severity

**What it is:** Showing only messages at or above a specific importance level.

**Why it matters:** High-severity messages indicate critical problems. Lower levels are informational.

**Severity levels** (0-7):
- **0**: emerg (emergency)
- **1**: alert
- **2**: crit (critical)
- **3**: err (error)
- **4**: warning
- **5**: notice
- **6**: info
- **7**: debug

Show levels 0-3 (most important):
```bash
journalctl -p 3
```

Show only levels 2 and 3:
```bash
journalctl -p 2..3
```

#### 1.3.7. Monitoring Logs in Real Time

**What it is:** Watching new log messages as they arrive.

**Why it matters:** Real-time monitoring helps diagnose problems as they happen or observe service startup.

**How to monitor:**

Follow all new messages:
```bash
journalctl -f
```

Follow messages from specific unit:
```bash
journalctl -f -u nginx.service
```

### 1.4. Logfile Rotation

**What it is:** The process of archiving old text logs and creating new ones to prevent disk space exhaustion.

**Why it matters:** Without rotation, log files grow indefinitely and can fill your disk.

**How it works:** The `logrotate` utility periodically renames log files and creates new ones.

<ProcessFlow
  title="Log Rotation Process"
  steps={[
    { title: 'Delete auth.log.3', description: 'Remove oldest log', color: colors.red },
    { title: 'Rename auth.log.2 → auth.log.3', description: 'Shift older logs', color: colors.orange },
    { title: 'Rename auth.log.1 → auth.log.2', description: 'Shift recent logs', color: colors.yellow },
    { title: 'Rename auth.log → auth.log.1', description: 'Archive current log', color: colors.blue },
    { title: 'Create new auth.log', description: 'Start fresh log file', color: colors.green }
  ]}
/>

Common logrotate configurations:
- **Compression**: Older logs compressed with gzip (e.g., `auth.log.2.gz`)
- **Date suffixes**: Some systems use dates (e.g., `auth.log-20200529`)
- **Retention**: Number of old logs to keep

:::info File Handle Behavior
If a program has a log file open when logrotate renames it, the write still succeeds. The data goes to the renamed file because Linux tracks files by inode, not name.
:::

### 1.5. Journal Maintenance

**What it is:** How journald manages disk space for binary logs.

**Why it matters:** Unlike text logs, journals use space-based limits rather than rotation.

**How it works:** journald automatically removes old messages based on:
- Available filesystem space
- Maximum journal size
- Percentage of filesystem to use
- Maximum age of messages

Configuration is in `/etc/systemd/journald.conf`. See `journald.conf(5)` for details.

### 1.6. System Logging Architecture

#### 1.6.1. Historical Context

**What it is:** The evolution of Unix/Linux logging from ad-hoc methods to standardized systems.

**Why it matters:** Understanding the history explains why multiple logging systems coexist.

**How it evolved:**
1. **1980s**: No standard logging; each service invented its own
2. **Syslog emerges**: Bundled with sendmail, quickly adopted
3. **Network logging**: Syslog gained ability to aggregate logs across machines
4. **Modern era**: journald provides structured logging; syslog remains for network aggregation

#### 1.6.2. Facility and Severity

**What it is:** Classification metadata attached to log messages.

**Why it matters:** Facilities and severities allow routing messages to different destinations (files, consoles, users).

**Facility**: General category of the service (kernel, mail, printer, etc.)

**Severity**: Urgency of the message (0-7, as shown earlier)

**Priority**: Combined facility + severity value sent in the syslog protocol

:::warning Legacy Design
Facilities are hardwired in the protocol (including obsolete ones like UUCP). Only generic slots like `local0`-`local7` are available for new services.
:::

#### 1.6.3. Syslog vs journald

**What it is:** Two complementary logging architectures with different strengths.

**Why both exist:**

<CardGrid
  title="Syslog Strengths"
  cards={[
    {
      title: 'Network Aggregation',
      description: 'Collect logs from many machines onto one server',
      color: colors.blue
    },
    {
      title: 'Modularity',
      description: 'Output to many formats and databases',
      color: colors.green
    }
  ]}
/>

<CardGrid
  title="journald Strengths"
  cards={[
    {
      title: 'Single Machine Focus',
      description: 'Excellent local log organization and querying',
      color: colors.purple
    },
    {
      title: 'Structured Data',
      description: 'Rich metadata and fast field-based searching',
      color: colors.orange
    },
    {
      title: 'Integration',
      description: 'Captures service output that bypasses syslog',
      color: colors.red
    }
  ]}
/>

**Common setup**: journald collects all local logs, optionally forwards to rsyslogd for network aggregation and analysis.

## 2. The Structure of /etc

### 2.1. Understanding /etc Organization

**What it is:** `/etc` is the directory containing system-wide configuration files.

**Why it matters:** Knowing where configurations live helps you customize and troubleshoot your system.

**How it's organized:** Modern systems use subdirectories instead of individual files to:
- Make configurations easier to find
- Prevent upgrades from overwriting customizations
- Allow modular configuration

<TreeDiagram
  title="/etc Directory Structure"
  root={{
    name: '/etc',
    children: [
      {
        name: 'systemd/',
        description: 'systemd configuration',
        children: [
          { title: 'system/', description: 'System units' },
          { title: 'user/', description: 'User units' }
        ]
      },
      {
        name: 'network/',
        description: 'Network configuration',
        children: [
          { title: 'interfaces', description: 'Network interfaces' }
        ]
      },
      {
        name: 'grub.d/',
        description: 'GRUB bootloader config',
        children: [
          { title: '00_header', description: 'GRUB header' },
          { title: '10_linux', description: 'Linux kernels' }
        ]
      },
      { title: 'passwd', description: 'User database' },
      { title: 'shadow', description: 'Password hashes' },
      { title: 'group', description: 'Group database' },
      { title: 'fstab', description: 'Filesystem table' }
    ]
  }}
/>

**Configuration guideline**: Files in `/etc` should be:
- Machine-specific (like user accounts, network settings)
- Customizable by administrators

**Not in /etc**: Application defaults and prepackaged configurations (those go in `/usr/lib` or similar).

## 3. User Management Files

### 3.1. The /etc/passwd File

**What it is:** The database mapping usernames to user IDs and other account information.

**Why it matters:** The kernel only knows numeric user IDs. This file translates between human-readable names and kernel IDs.

**How it's structured:** Seven colon-separated fields per line:

```
username:password:UID:GID:GECOS:homedir:shell
```

Example entry:
```
juser:x:3119:1000:J. Random User:/home/juser:/bin/bash
```

<CardGrid
  title="/etc/passwd Fields"
  cards={[
    {
      title: '1. Username',
      description: 'Login name (e.g., juser)',
      color: colors.blue
    },
    {
      title: '2. Password',
      description: 'x = in /etc/shadow, * = login disabled',
      color: colors.red
    },
    {
      title: '3. User ID (UID)',
      description: 'Numeric ID used by kernel (must be unique)',
      color: colors.green
    },
    {
      title: '4. Group ID (GID)',
      description: 'Primary group from /etc/group',
      color: colors.yellow
    },
    {
      title: '5. GECOS',
      description: 'Real name and optional contact info',
      color: colors.purple
    },
    {
      title: '6. Home Directory',
      description: 'User\'s home directory path',
      color: colors.orange
    },
    {
      title: '7. Shell',
      description: 'Login shell program',
      color: colors.cyan
    }
  ]}
/>

:::warning Password Field Security
- `x` means the encrypted password is in `/etc/shadow` (normal and secure)
- `*` means the user cannot log in
- Blank (::) means no password required (NEVER do this!)
:::

**File format rules:**
- No comments allowed
- No blank lines allowed
- Strict syntax required

:::info Account vs User Entry
An "account" is the `/etc/passwd` entry plus a home directory. However, the home directory doesn't need to exist for most programs to recognize the account.
:::

### 3.2. Special Users

**What they are:** System accounts that serve special purposes.

**Why they exist:** Security and functionality. Running services as unprivileged users limits damage from compromises.

**Common special users:**

<CardGrid
  title="Special User Accounts"
  cards={[
    {
      title: 'root (UID 0)',
      description: 'Superuser with unlimited privileges',
      color: colors.red
    },
    {
      title: 'nobody',
      description: 'Unprivileged user for running restricted services',
      color: colors.gray
    },
    {
      title: 'daemon',
      description: 'System service processes (no login)',
      color: colors.blue
    }
  ]}
/>

**Pseudo-users**: Users that cannot log in but can run processes. Created for security isolation.

:::info Kernel Perspective
Only UID 0 (root) has special meaning to the kernel. All other user restrictions are user-space conventions.
:::

### 3.3. The /etc/shadow File

**What it is:** Secure storage for password hashes and expiration information.

**Why it matters:** Keeps password hashes unreadable by normal users, improving security.

**How it works:** One entry per user, corresponding to `/etc/passwd`. Fields include:
- Encrypted password hash
- Last password change date
- Minimum/maximum password age
- Password expiration warnings
- Account expiration date

**Permissions**: Only root can read `/etc/shadow`.

### 3.4. Manipulating Users and Passwords

#### 3.4.1. User Commands

**What they are:** Tools regular users can run to modify their own account.

**Common commands:**
- `passwd`: Change your password
- `chfn`: Change your real name (GECOS field)
- `chsh`: Change your login shell (must be in `/etc/shells`)

These are setuid-root executables because only root can modify `/etc/passwd`.

#### 3.4.2. Superuser Commands

**What they are:** Tools for root to manage all user accounts.

**Why not edit directly:** Editing `/etc/passwd` manually risks:
- Syntax errors breaking authentication
- Concurrency issues if multiple processes modify simultaneously
- Forgetting to update `/etc/shadow`

**Recommended commands:**
- `passwd user`: Set a user's password
- `adduser` or `useradd`: Create new user
- `userdel`: Delete user

**Emergency editing** (avoid if possible):
- `vipw`: Edit `/etc/passwd` with locking and backups
- `vipw -s`: Edit `/etc/shadow` with locking and backups

### 3.5. Working with Groups

**What they are:** Collections of users for shared file access permissions.

**Why they exist:** Groups allow multiple users to collaborate on files. Less critical on single-user workstations.

**The /etc/group file** format:
```
groupname:password:GID:user1,user2,user3
```

Example:
```
disk:*:6:juser,beazley
```

<CardGrid
  title="/etc/group Fields"
  cards={[
    {
      title: '1. Group Name',
      description: 'Shown by ls -l',
      color: colors.blue
    },
    {
      title: '2. Password',
      description: 'Nearly always * (disabled)',
      color: colors.red
    },
    {
      title: '3. Group ID (GID)',
      description: 'Numeric ID (must be unique)',
      color: colors.green
    },
    {
      title: '4. User List',
      description: 'Additional members (comma-separated)',
      color: colors.purple
    }
  ]}
/>

**View your groups:**
```bash
groups
```

:::info Group Membership
Users belong to a group if:
1. The group GID is in their `/etc/passwd` entry (primary group), OR
2. They're listed in the group's user list (supplementary group)
:::

:::info Modern Practice
Many distributions create a new group for each user with the same name as the username.
:::

## 4. getty and login

**What they are:** Programs that handle terminal login prompts.

**Why they matter historically:** In the past, these managed all logins. Now they're mainly for virtual terminals (Ctrl-Alt-F1, etc.).

**How they work:**

<ProcessFlow
  title="Login Process"
  steps={[
    { title: 'getty', description: 'Displays login prompt on terminal', color: colors.blue },
    { title: 'User enters name', description: 'getty reads username', color: colors.gray },
    { title: 'login', description: 'Prompts for password (via PAM)', color: colors.green },
    { title: 'Shell', description: 'Starts user\'s shell if successful', color: colors.purple }
  ]}
/>

**Process behavior:**
1. `getty` attaches to terminal and shows prompt
2. User enters username
3. `getty` replaces itself with `login` using `exec()`
4. `login` verifies password
5. `login` replaces itself with user's shell using `exec()`

**Modern reality:** Most users log in through:
- Graphical display managers (gdm, lightdm)
- SSH (remote access)
- Neither uses getty or login

## 5. Setting the Time

### 5.1. Understanding System Time

**What it is:** How Linux keeps track of the current date and time.

**Why it matters:** Accurate time is critical for logging, security (certificates), scheduled tasks, and file timestamps.

**How it works:**

<StackDiagram
  title="Time System Architecture"
  layers={[
    { title: 'User Space', description: 'date command, applications', color: colors.blue },
    { title: 'Kernel', description: 'System clock (seconds since Jan 1, 1970 UTC)', color: colors.green },
    { title: 'Hardware', description: 'Real-Time Clock (RTC) with battery backup', color: colors.orange }
  ]}
/>

**Three clocks in play:**
1. **Kernel system clock**: Seconds since Unix epoch (Jan 1, 1970 00:00:00 UTC)
2. **Hardware RTC**: Battery-backed clock that persists across reboots
3. **Network time**: Accurate time from internet time servers

**View current time:**
```bash
date
```

**View time as Unix timestamp:**
```bash
date +%s
```

### 5.2. Hardware Clock Management

**What it is:** Synchronizing the hardware RTC with the system clock.

**Why it matters:** At boot, the kernel sets its clock from the RTC. Keeping the RTC accurate helps timekeeping across reboots.

**Set RTC to system clock** (in UTC):
```bash
hwclock --systohc --utc
```

:::warning Use UTC for RTC
Always keep your hardware clock in UTC to avoid problems with time zones and daylight saving time.
:::

**Time drift problem:**
- Kernel clock drifts over time (worse than RTC)
- Long-running systems accumulate significant errors
- Don't manually correct with `hwclock` (can cause time to jump backward)
- Use network time instead

### 5.3. Time Zones

**What it is:** User-space translation of kernel UTC time to local time.

**Why it matters:** Humans think in local time; computers work in UTC. Time zones bridge the gap.

**How it works:**
- Kernel stores time as seconds since epoch (UTC)
- User-space programs convert using `/etc/localtime`
- Time zone data files in `/usr/share/zoneinfo`

**Set system time zone:**

Option 1 - Copy file:
```bash
sudo cp /usr/share/zoneinfo/America/New_York /etc/localtime
```

Option 2 - Symbolic link:
```bash
sudo ln -sf /usr/share/zoneinfo/America/New_York /etc/localtime
```

Option 3 - Use distribution tool:
```bash
tzselect  # Interactive helper
```

**Set time zone for one shell session:**
```bash
export TZ=US/Central
date
```

**Set time zone for one command:**
```bash
TZ=US/Central date
```

### 5.4. Network Time

**What it is:** Synchronizing your system clock with accurate time servers on the internet.

**Why it matters:** Network time provides accuracy far beyond what hardware clocks can achieve.

**How it works:** NTP (Network Time Protocol) daemons periodically query time servers and smoothly adjust the system clock.

**Modern implementation**: Most Linux systems use `systemd-timesyncd`:
- Enabled by default
- Minimal configuration needed
- Config: `/etc/systemd/timesyncd.conf`

**Check status:**
```bash
timedatectl status
```

**Alternative: ntpd**

If you need to disable timesyncd and use traditional ntpd:
```bash
sudo systemctl disable systemd-timesyncd
sudo systemctl stop systemd-timesyncd
# Install and configure ntpd
```

**Offline systems**: Use `chronyd` to maintain time during disconnections.

**Update RTC from network time:**
```bash
sudo hwclock --systohc --utc
```

## 6. Scheduling Recurring Tasks

### 6.1. Introduction to Task Scheduling

**What it is:** Running programs automatically on a repeating schedule.

**Why it matters:** Essential for system maintenance (log rotation, backups, updates) and automation.

**Two options:**
1. **cron**: Traditional, simple, widely used
2. **systemd timer units**: Modern, more features, better integration

### 6.2. Cron Jobs

#### 6.2.1. Crontab Format

**What it is:** A text file specifying when to run commands.

**How it works:** Five time fields plus a command:

```
minute hour day month weekday command
```

<CardGrid
  title="Crontab Time Fields"
  cards={[
    {
      title: '1. Minute',
      description: '0-59',
      color: colors.blue
    },
    {
      title: '2. Hour',
      description: '0-23 (24-hour format)',
      color: colors.green
    },
    {
      title: '3. Day of Month',
      description: '1-31',
      color: colors.yellow
    },
    {
      title: '4. Month',
      description: '1-12',
      color: colors.orange
    },
    {
      title: '5. Day of Week',
      description: '0-7 (0 and 7 = Sunday)',
      color: colors.purple
    }
  ]}
/>

**Special characters:**
- `*` = every value (every day, every month, etc.)
- `,` = multiple values (5,14 = 5th and 14th)

**Examples:**

Run at 9:15 AM every day:
```
15 09 * * * /home/juser/bin/spmake
```

Run at 9:15 AM on the 14th of each month:
```
15 09 14 * * /home/juser/bin/spmake
```

Run at 9:15 AM on the 5th and 14th of each month:
```
15 09 5,14 * * /home/juser/bin/spmake
```

:::info Output Handling
Cron emails output and errors to the job owner (if email works). Redirect to `/dev/null` if you don't want email.
:::

#### 6.2.2. Installing Crontab Files

**What it is:** Adding your scheduled tasks to the cron system.

**Where they're stored:** `/var/spool/cron/crontabs` (not directly editable).

**User crontab commands:**

Install crontab from file:
```bash
crontab myfile
```

List your cron jobs:
```bash
crontab -l
```

Edit crontab interactively:
```bash
crontab -e
```

Remove your crontab:
```bash
crontab -r
```

**Benefits of `crontab -e`:**
- Checks syntax before installing
- Prevents concurrent editing conflicts
- Safer than editing files directly

#### 6.2.3. System Crontab Files

**What it is:** System-wide scheduled tasks managed by the administrator.

**Difference from user crontabs:** System crontabs have an additional field specifying which user runs the job.

**Location:** `/etc/crontab`

**Format:**
```
minute hour day month weekday user command
```

Example:
```
42 6 * * * root /usr/local/bin/cleansystem > /dev/null 2>&1
```

**Additional system crontabs:**
- `/etc/cron.d/`: Additional crontab files (any name, same format as `/etc/crontab`)
- `/etc/cron.daily/`, `/etc/cron.weekly/`: Scripts run by cron jobs in `/etc/crontab`

### 6.3. Systemd Timer Units

#### 6.3.1. Understanding Timer Units

**What they are:** Systemd's alternative to cron for scheduled tasks.

**Why they exist:** Provide better integration with systemd, more flexible scheduling, and superior logging.

**How they work:** Two unit files required:
1. **Timer unit** (.timer): Defines the schedule
2. **Service unit** (.service): Defines what to run

<ConnectionDiagram
  title="Timer Unit Architecture"
  nodes={[
    { id: 'timer', label: 'loggertest.timer', color: colors.blue },
    { id: 'service', label: 'loggertest.service', color: colors.green },
    { id: 'command', label: '/usr/bin/logger', color: colors.purple }
  ]}
  connections={[
    { from: 'timer', to: 'service', label: 'activates' },
    { from: 'service', to: 'command', label: 'executes' }
  ]}
/>

#### 6.3.2. Creating a Timer Unit

**Example timer** (`/etc/systemd/system/loggertest.timer`):

```ini
[Unit]
Description=Example timer unit

[Timer]
OnCalendar=*-*-* *:00,20,40
Unit=loggertest.service

[Install]
WantedBy=timers.target
```

**OnCalendar format**: `year-month-day hour:minute:second`

**Special characters:**
- `*` = wildcard (any value)
- `,` = multiple values (00,20,40)
- `/` = intervals (*:00/20 = every 20 minutes)

**Example service** (`/etc/systemd/system/loggertest.service`):

```ini
[Unit]
Description=Example Test Service

[Service]
Type=oneshot
ExecStart=/usr/bin/logger -p local3.debug I'm a logger
```

**Type=oneshot** means:
- Command runs and exits (not a long-running daemon)
- Systemd waits for completion before marking as started
- Multiple `ExecStart` commands allowed
- Better logging and dependency tracking

**Enable and start:**
```bash
sudo systemctl enable loggertest.timer
sudo systemctl start loggertest.timer
```

**Check timer status:**
```bash
systemctl list-timers
```

#### 6.3.3. Cron vs Timer Units

<CardGrid
  title="Cron Advantages"
  cards={[
    {
      title: 'Simple Configuration',
      description: 'One-line format, easy to understand',
      color: colors.blue
    },
    {
      title: 'Compatibility',
      description: 'Works with third-party services',
      color: colors.green
    },
    {
      title: 'User-Friendly',
      description: 'Easy for users to install their own tasks',
      color: colors.purple
    }
  ]}
/>

<CardGrid
  title="Timer Unit Advantages"
  cards={[
    {
      title: 'Process Tracking',
      description: 'Superior monitoring with cgroups',
      color: colors.blue
    },
    {
      title: 'Logging',
      description: 'Excellent diagnostic information in journal',
      color: colors.green
    },
    {
      title: 'Flexibility',
      description: 'More scheduling options and frequencies',
      color: colors.orange
    },
    {
      title: 'Integration',
      description: 'Use systemd dependencies and activation',
      color: colors.purple
    }
  ]}
/>

## 7. Scheduling One-Time Tasks

### 7.1. The at Command

**What it is:** Schedule a job to run once at a future time.

**Why it matters:** Sometimes you need a one-off delayed task without setting up a recurring schedule.

**How to use:**

Schedule a job for 10:30 PM:
```bash
at 22:30
at> /usr/local/bin/myjob
at> <Ctrl-D>
```

Schedule a job for a specific date:
```bash
at 22:30 30.09.15
```

View scheduled jobs:
```bash
atq
```

Remove a scheduled job:
```bash
atrm job_number
```

### 7.2. Timer Unit Equivalents

**What it is:** Using systemd transient timer units for one-time tasks.

**How to use:**

Run a command at a specific date/time:
```bash
sudo systemd-run --on-calendar='2022-08-14 18:00' /bin/echo "this is a test"
```

Run a command after a time offset:
```bash
sudo systemd-run --on-active=30m /bin/echo "runs in 30 minutes"
```

:::warning Include Date
When using `--on-calendar`, always include a future date. Otherwise, the timer runs daily at that time (like a recurring cron job).
:::

**View transient timers:**
```bash
systemctl list-timers
```

### 7.3. User Timer Units

**What it is:** Running timer units as a regular user instead of root.

**How to create:**
```bash
systemd-run --user --on-active=5m /bin/echo "user timer"
```

**Problem**: User timers stop when you log out.

**Solution**: Enable user manager persistence:

For yourself:
```bash
loginctl enable-linger
```

For another user (as root):
```bash
sudo loginctl enable-linger username
```

## 8. User Access Topics

### 8.1. User IDs and User Switching

**What it is:** How processes change from one user to another.

**Why it matters:** Understanding this explains how `sudo`, `su`, and `login` work.

**Two mechanisms:**
1. **setuid executables**: Binary has setuid bit; runs as file owner
2. **setuid() system call**: Process requests to become another user

**Kernel rules:**
1. Any process can run a setuid executable (with proper file permissions)
2. Root (UID 0) can call `setuid()` to become any user
3. Non-root processes have severe restrictions on `setuid()`

**Example**: How `sudo` works:
1. `/usr/bin/sudo` is setuid root
2. When you run it, the process runs as root
3. `sudo` verifies you're authorized (checks `/etc/sudoers`)
4. `sudo` calls `setuid()` to become the target user
5. `sudo` executes your command

:::info No Passwords in Kernel
User switching has nothing to do with passwords or usernames at the kernel level. Those are purely user-space concepts.
:::

### 8.2. Process Ownership UIDs

**What they are:** Every process has multiple user IDs.

**Why they exist:** Different IDs serve different purposes (access control vs ownership).

**Three main UIDs:**

<CardGrid
  title="Process User IDs"
  cards={[
    {
      title: 'Effective UID (euid)',
      description: 'Determines file access permissions and what the process can do',
      color: colors.blue
    },
    {
      title: 'Real UID (ruid)',
      description: 'Identifies who started the process; determines who can kill it',
      color: colors.green
    },
    {
      title: 'Saved UID',
      description: 'Allows process to switch between euid and ruid',
      color: colors.purple
    }
  ]}
/>

**Analogy**: Think of euid as the "actor" and ruid as the "owner."

**View both UIDs:**
```bash
ps -eo pid,euser,ruser,comm
```

**Typical behavior**: For most processes, euid = ruid. They differ only for setuid programs.

**Common setuid program behavior**: Programs like `sudo` explicitly set both euid and ruid to the same value to avoid confusion and security issues.

### 8.3. Security Implications

**What they are:** Risks associated with setuid programs.

**Why they matter:** setuid-root programs are primary attack vectors.

**Key dangers:**
1. **Excessive setuid binaries**: Each one is a potential security hole
2. **Buggy setuid programs**: Exploits grant attacker root access
3. **Accidental setuid**: Making bash setuid-root gives everyone root access

**Security principles:**
- Minimize number of setuid-root programs
- Carefully audit setuid program code
- Never create custom setuid-root programs without expert review

### 8.4. Authentication Overview

**What it is:** The three aspects of user security.

**Three components:**

<CardGrid
  title="Security Components"
  cards={[
    {
      title: 'Identification',
      description: 'Who are you? (username)',
      color: colors.blue
    },
    {
      title: 'Authentication',
      description: 'Prove it! (password, key, biometric)',
      color: colors.green
    },
    {
      title: 'Authorization',
      description: 'What are you allowed to do?',
      color: colors.purple
    }
  ]}
/>

**Kernel's role:**
- Knows user IDs (identification)
- Knows authorization rules (setuid rules, file permissions)
- Doesn't know authentication (passwords handled in user space)

**User-space authentication** traditionally involved:
1. Process calls `geteuid()` to get its user ID
2. Process opens `/etc/passwd` and searches for matching UID
3. Process finds username, encrypted password
4. Process prompts user, encrypts input, compares

**Problem**: Every program reimplementing this was error-prone and inflexible.

### 8.5. Using Libraries for User Information

**What it is:** Standard library functions for user/password operations.

**Why it matters:** Centralized code means consistency, maintainability, and flexibility.

**Example functions:**
- `getpwuid()`: Get username from UID
- `getpwnam()`: Get user info from username

**Benefits:**
- Single implementation in shared library
- All programs automatically get updates
- Can switch authentication backend (e.g., to LDAP) without recompiling programs

**Limitations of library approach:**
- Hard to standardize password encryption
- Assumes you have access to password file
- Assumes password-based authentication
- No support for 2FA, smart cards, biometrics

**Solution**: PAM (Pluggable Authentication Modules)

## 9. Pluggable Authentication Modules (PAM)

### 9.1. Understanding PAM

**What it is:** A flexible framework for user authentication.

**Why it exists:** Programs need authentication, but requirements vary wildly:
- Passwords, smart cards, fingerprints, 2FA
- Network authentication (LDAP, Kerberos)
- Per-service access control

**How it works:** Applications hand authentication to PAM, which loads modules to perform the actual authentication.

<ProcessFlow
  title="PAM Authentication Flow"
  steps={[
    { title: 'Application', description: 'Requests authentication (e.g., login)', color: colors.blue },
    { title: 'PAM Library', description: 'Reads /etc/pam.d/login config', color: colors.gray },
    { title: 'PAM Modules', description: 'Execute authentication steps', color: colors.green },
    { title: 'Result', description: 'Success or failure returned to app', color: colors.purple }
  ]}
/>

**Module examples:**
- `pam_unix.so`: Check Unix password
- `pam_shells.so`: Verify user's shell is valid
- `pam_rootok.so`: Allow root without password

### 9.2. PAM Configuration

**Location**: `/etc/pam.d/` (one file per application)

**Configuration line format:**
```
function control module [arguments]
```

**Example** (`/etc/pam.d/chsh`):
```
auth requisite pam_shells.so
```

Meaning: To authenticate with `chsh`, user's shell must be in `/etc/shells`.

#### 9.2.1. Function Types

<CardGrid
  title="PAM Functions"
  cards={[
    {
      title: 'auth',
      description: 'Authenticate user (verify identity)',
      color: colors.blue
    },
    {
      title: 'account',
      description: 'Check account status (authorized?)',
      color: colors.green
    },
    {
      title: 'session',
      description: 'Perform session setup (display MOTD, etc.)',
      color: colors.purple
    },
    {
      title: 'password',
      description: 'Change password or credentials',
      color: colors.red
    }
  ]}
/>

**Important**: Module behavior depends on function. `pam_unix.so` with `auth` checks password; with `password` it sets password.

#### 9.2.2. Control Arguments

**What they are:** Determine what happens after a module succeeds or fails.

**Stacking**: Multiple rules can apply; control arguments determine if PAM continues or stops.

<CardGrid
  title="Simple Control Arguments"
  cards={[
    {
      title: 'sufficient',
      description: 'Success → authentication succeeds immediately. Failure → continue to next rule.',
      color: colors.green
    },
    {
      title: 'requisite',
      description: 'Success → continue. Failure → authentication fails immediately.',
      color: colors.red
    },
    {
      title: 'required',
      description: 'Success → continue. Failure → continue but will ultimately fail.',
      color: colors.orange
    }
  ]}
/>

**Example stack** (`/etc/pam.d/chsh`):

```
auth sufficient pam_rootok.so
auth requisite  pam_shells.so
auth sufficient pam_unix.so
auth required   pam_deny.so
```

**Execution flow:**

<ProcessFlow
  title="PAM Rule Execution"
  steps={[
    { title: 'pam_rootok.so', description: 'Root? → succeed immediately (sufficient)', color: colors.green },
    { title: 'pam_shells.so', description: 'Shell valid? No → fail immediately (requisite)', color: colors.red },
    { title: 'pam_unix.so', description: 'Password correct? → succeed (sufficient)', color: colors.blue },
    { title: 'pam_deny.so', description: 'Always fails (default deny)', color: colors.gray }
  ]}
/>

**Advanced syntax**: Square brackets `[]` allow fine-grained control based on specific return values.

#### 9.2.3. Module Arguments

**What they are:** Options passed to modules after the module name.

**Example:**
```
auth sufficient pam_unix.so nullok
```

The `nullok` argument allows users with blank passwords (default would reject).

### 9.3. PAM Configuration Tips

**Finding modules:**
```bash
man -k pam_
locate pam_unix.so
```

**Reading documentation**: Each module has a man page describing functions and arguments.

**Generated configs**: Many distributions auto-generate PAM configs. Check file comments before editing.

**Default config**: `/etc/pam.d/other` defines default for applications without specific configs (usually denies everything).

**Including configs**: Use `@include filename` or control-argument-based includes to share common configurations.

**Additional config**: Some modules read files in `/etc/security` for per-user restrictions.

### 9.4. PAM and Passwords

**Historical confusion**: `/etc/login.defs` contains password encryption settings for the old shadow password suite. PAM mostly ignores this file.

**Setting passwords**: Find the `password` function configuration:
```bash
grep 'password.*pam_unix' /etc/pam.d/*
```

Example result:
```
password sufficient pam_unix.so obscure sha512
```

**Arguments meaning:**
- `obscure`: Check password isn't too similar to old password
- `sha512`: Encrypt with SHA512 algorithm

**Verifying passwords**: `pam_unix.so` tries multiple algorithms automatically (using libcrypt). No explicit configuration needed for verification.

## 10. Looking Forward

We've explored the vital components of Linux system configuration:
- **Logging**: Finding problems with journald and syslog
- **Users**: Managing accounts, passwords, and permissions
- **Time**: Keeping accurate time with NTP
- **Scheduling**: Automating tasks with cron and timers
- **Authentication**: Securing access with PAM

These user-space services provide essential infrastructure for a working Linux system. They demonstrate how Linux divides complex functionality into independent, interacting components.

Next, we'll refine our understanding of user-space processes by diving back into the kernel to explore process internals and resource utilization in Chapter 8.
