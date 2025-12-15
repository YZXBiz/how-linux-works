---
sidebar_position: 3
title: "Virtualization"
description: "Understand virtual machines, containers, Docker, and how Linux creates isolated environments for running multiple systems"
---

import { ProcessFlow, StackDiagram, CardGrid, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# Virtualization

The word "virtual" can be vague in computing systems. It's used primarily to indicate an intermediary that translates a complex or fragmented underlying layer to a simplified interface that can be used by multiple consumers.

**Simpler definition:** Virtualization typically means creating isolated environments so that you can get multiple systems to run without clashing.

This chapter explores two major virtualization technologies: virtual machines and containers.

## 1. Understanding Virtualization

### 1.1. What Is Virtualization?

**Technical definition:** An intermediary that translates a complex underlying layer to a simplified interface for multiple consumers.

**Example you've seen:** Virtual memory allows multiple processes to access a large bank of memory as if each had its own insulated bank of memory.

**Typical purpose:** Creating isolated environments so multiple systems can run without conflicts.

### 1.2. Chapter Overview

**Virtual machines:** We'll start at a higher level, explaining terminology and concepts you'll encounter when working with virtual machines, without diving into implementation details.

**Containers:** We'll go into more technical detail on containers. They're built with technology you've already seen in this book, and it's relatively easy to explore containers interactively.

## 2. Virtual Machines

Virtual machines are based on the same concept as virtual memory, except with **all of the machine's hardware** instead of just memory.

### 2.1. What Are System Virtual Machines?

**Definition:** You create an entirely new machine (processor, memory, I/O interfaces, and so on) with the help of software, and run a whole operating system in it—including a kernel.

**Official name:** System virtual machine

**History:** This technology has been around for decades. For example, IBM mainframes traditionally use system virtual machines to create a multiuser environment; users get their own virtual machine running CMS, a simple single-user operating system.

### 2.2. Two Types of Virtual Machines

#### 2.2.1. Software Emulators

**What it is:** Virtual machine constructed entirely in software

**Alternative name:** Emulator

**Performance:** Slower than hardware-assisted virtualization

**Examples:** Emulators for old computer and gaming systems (Commodore 64, Atari 2600)

#### 2.2.2. Hardware-Assisted Virtual Machines

**What it is:** Virtual machine that utilizes the underlying hardware as much as possible

**How it works:** Similar to virtual memory implementation

**Performance:** Superior to software emulation

**Focus:** This chapter focuses on hardware-assisted virtual machines for Linux.

<StackDiagram
  title="Virtual Machine Architecture"
  layers={[
    { label: 'Guest OS 1 (Linux)', color: colors.blue, items: ['Complete operating system with kernel'] },
    { label: 'Guest OS 2 (Windows)', color: colors.green, items: ['Another complete operating system'] },
    { label: 'Hypervisor (VMM)', color: colors.purple, items: ['Manages virtual machines and resources'] },
    { label: 'Physical Hardware', color: colors.orange, items: ['CPU, memory, storage, network'] }
  ]}
/>

:::info Ease of Use
Using virtual machines is far simpler than describing them. For example, in VirtualBox, you can use the GUI to create and run a virtual machine or use the command-line `VBoxManage` tool for scripting. Web interfaces of cloud services also facilitate administration.

Due to this ease of use, we'll concentrate more on making sense of the technology and terminology than operational details.
:::

### 2.3. Hypervisors

Overseeing one or more virtual machines on a computer is a piece of software called a **hypervisor** or **virtual machine monitor (VMM)**.

**How it works:** Similar to how an operating system manages processes.

**Two types:** Type 1 and Type 2 hypervisors

#### 2.3.1. Type 2 Hypervisors

**What it is:** Runs on a normal operating system such as Linux

**Most familiar to users:** Regular desktop application

**Example:** VirtualBox is a type 2 hypervisor

**Installation:** Run it on your system without extensive modifications

**Use case:** You might have already used VirtualBox while reading this book to test and explore different Linux systems

<CardGrid
  title="Type 2 Hypervisor Characteristics"
  cards={[
    {
      title: 'Runs on OS',
      description: 'Operates as application on top of existing operating system (Windows, macOS, Linux)',
      color: colors.blue
    },
    {
      title: 'Easy Setup',
      description: 'No extensive system modifications needed; install like any application',
      color: colors.green
    },
    {
      title: 'Desktop Use',
      description: 'Ideal for testing, development, and running multiple OS on single machine',
      color: colors.purple
    },
    {
      title: 'Examples',
      description: 'VirtualBox, VMware Workstation, Parallels Desktop',
      color: colors.orange
    }
  ]}
/>

#### 2.3.2. Type 1 Hypervisors

**What it is:** More like its own operating system (especially the kernel), built specifically to run virtual machines quickly and efficiently

**Management helper:** Might occasionally employ a conventional companion system such as Linux to help with management tasks

**Your interaction:** Even if you never run one on your own hardware, you interact with type 1 hypervisors all the time

**Prevalence:** All cloud computing services run as virtual machines under type 1 hypervisors such as Xen

**Common scenario:** When you access a website, you're almost certainly hitting software running on a type 1 hypervisor virtual machine

**Cloud services:** Creating an instance on AWS or other cloud service is creating a virtual machine on a type 1 hypervisor

<CardGrid
  title="Type 1 Hypervisor Characteristics"
  cards={[
    {
      title: 'Bare Metal',
      description: 'Runs directly on hardware without underlying OS; acts as its own operating system',
      color: colors.blue
    },
    {
      title: 'High Performance',
      description: 'Built specifically for running VMs quickly and efficiently; minimal overhead',
      color: colors.green
    },
    {
      title: 'Enterprise/Cloud',
      description: 'Used by all major cloud providers (AWS, Azure, Google Cloud)',
      color: colors.purple
    },
    {
      title: 'Examples',
      description: 'Xen, VMware ESXi, Microsoft Hyper-V, KVM',
      color: colors.orange
    }
  ]}
/>

### 2.4. Guest and Host Terminology

**Guest:** A virtual machine with its operating system

**Host:** Whatever runs the hypervisor

**Type 2 host:** Your native system (the OS you installed VirtualBox on)

**Type 1 host:** The hypervisor itself, possibly combined with a specialized companion system

<ProcessFlow
  title="Virtual Machine Lifecycle"
  steps={[
    {
      label: 'Create VM',
      detail: 'Define virtual hardware (CPU, RAM, disk)',
      color: colors.blue
    },
    {
      label: 'Install Guest OS',
      detail: 'Install operating system inside VM',
      color: colors.green
    },
    {
      label: 'Run Applications',
      detail: 'Guest OS runs programs normally',
      color: colors.purple
    },
    {
      label: 'Manage Resources',
      detail: 'Hypervisor allocates hardware to VMs',
      color: colors.orange
    }
  ]}
/>

## 3. Hardware in a Virtual Machine

In theory, it should be straightforward for the hypervisor to provide hardware interfaces for a guest system. However, strict hardware virtualization is inefficient.

### 3.1. Simple Virtualization Example

**Concept:** To provide a virtual disk device, create a big file on the host and provide access as a disk with standard device I/O emulation

**Type:** This is a strict hardware virtual machine

**Problem:** Very inefficient

### 3.2. Paravirtualization

Making virtual machines practical requires some changes.

**What it is:** Bridging that allows guests to access host resources more directly

**Technical term:** Bypassing virtual hardware between host and guest is known as **paravirtualization**

**Common applications:**

<CardGrid
  title="Common Paravirtualization Use Cases"
  cards={[
    {
      title: 'Network Interfaces',
      description: 'Direct communication between guest and host networking for better performance',
      color: colors.blue
    },
    {
      title: 'Block Devices',
      description: 'Example: /dev/xvd on cloud instances (Xen virtual disk) using kernel driver to talk to hypervisor',
      color: colors.green
    },
    {
      title: 'Mouse Coordination',
      description: 'Desktop systems like VirtualBox coordinate mouse movement between VM window and host',
      color: colors.purple
    },
    {
      title: 'Shared Folders',
      description: 'Direct access to host filesystem from guest OS',
      color: colors.orange
    }
  ]}
/>

### 3.3. The Goal of Virtualization

Whatever the mechanism, the goal is always to reduce the problem just enough so that the guest operating system can treat the virtual hardware as it would any other device.

**Why this matters:** This ensures that all layers on top of the device function properly.

**Example:** On a Linux guest system, you want a kernel to access virtual disks as block devices so you can partition and create filesystems with the usual tools.

### 3.4. Virtual Machine CPU Modes

Most details about how virtual machines work are beyond this book's scope, but the CPU deserves mention because we've discussed the difference between kernel mode and user mode.

#### 3.4.1. Processor Privilege Levels

**Names vary:** Specific names depend on the processor (x86 processors use "privilege rings")

**Concept is constant:** The idea is always the same

**Kernel mode:** Processor can do almost anything

**User mode:** Some instructions are not allowed; memory access is limited

#### 3.4.2. Early x86 Virtual Machines

**Challenge:** First virtual machines for x86 architecture ran in user mode

**Problem:** The kernel running inside the virtual machine wants to be in kernel mode

**Solution:** The hypervisor detects and reacts to ("traps") any restricted instructions coming from a virtual machine

**How it works:** With a little work, the hypervisor emulates the restricted instructions, enabling virtual machines to run in kernel mode on an architecture not designed for it

**Performance:** Because most kernel instructions aren't restricted, those run normally, and the performance impact is fairly minimal

#### 3.4.3. Hardware Virtualization Support

Soon after hypervisor introduction, processor manufacturers realized there was a market for processors that could assist hypervisors.

**Intel solution:** VT-x feature set

**AMD solution:** AMD-V feature set

**Effect:** Eliminates the need for instruction trap and emulation

**Current state:** Most hypervisors now support these features; in some cases, they're required

:::info Learning More
If you want to learn more about virtual machines, start with *Virtual Machines: Versatile Platforms for Systems and Processes* by Jim Smith and Ravi Nair (Elsevier, 2005). This also includes coverage of process virtual machines, such as the Java virtual machine (JVM).
:::

## 4. Common Uses of Virtual Machines

In the Linux world, virtual machine use often falls into specific categories.

<CardGrid
  title="Virtual Machine Use Cases"
  cards={[
    {
      title: 'Testing and Trials',
      description: 'Try software outside normal/production environment. Test in separate machine. Experiment with new distributions safely. No need for new hardware.',
      color: colors.blue
    },
    {
      title: 'Application Compatibility',
      description: 'Run something under different operating system. Essential when you need OS that differs from your normal one.',
      color: colors.green
    },
    {
      title: 'Servers and Cloud',
      description: 'All cloud services built on VM technology. Quickest way to run internet server (web, database). Pay cloud provider for VM instance.',
      color: colors.purple
    }
  ]}
/>

## 5. Drawbacks of Virtual Machines

For many years, virtual machines have been the go-to method of isolating and scaling services. Because you can create virtual machines through a few clicks or an API, it's very convenient to create servers without installing and maintaining hardware.

### 5.1. Day-to-Day Operational Issues

:::warning Virtual Machine Challenges

**Installation and configuration:** Cumbersome and time-consuming to install and/or configure the system and application. Tools like Ansible can automate this, but it still takes significant time to bring up a system from scratch. For testing software, this time accumulates quickly.

**Slow startup:** Even when configured properly, virtual machines start and reboot relatively slowly. There are workarounds, but you're still booting a full Linux system.

**System maintenance:** You have to maintain a full Linux system, keeping current with updates and security on each virtual machine. These systems have systemd, sshd, and any tools your application depends on.

**Application conflicts:** Your application might have conflicts with standard software on a virtual machine. Applications have strange dependencies that don't always get along well with production machine software. Dependencies like libraries can change with an upgrade, breaking things that once worked.

**Resource waste:** Isolating services on separate virtual machines can be wasteful and costly. Standard practice is to run no more than one application service per system (robust and easier to maintain). Some services can be further segmented (multiple websites on different servers). However, this conflicts with keeping costs down, especially with cloud services that charge per VM instance.
:::

### 5.2. Relationship to Physical Hardware

These problems are really no different from ones you'd encounter running services on real hardware. They aren't necessarily impediments in small operations.

**Tipping point:** Once you start running more services, problems become more noticeable, costing time and money.

**Alternative solution:** This is when you might consider **containers** for your services.

## 6. Containers

Virtual machines are great for insulating an entire operating system and its set of running applications, but sometimes you need a lighter-weight alternative.

### 6.1. Evolution of Container Technology

#### 6.1.1. Traditional Approach

The traditional way of operating computer networks was to run multiple services on the same physical machine.

**Example:** A name server could also act as an email server and perform other tasks.

**Problem:** You shouldn't really trust any software (including servers) to be secure or stable.

#### 6.1.2. Early Isolation Techniques

To enhance system security and keep services from interfering with one another, there are basic ways to put up barriers around server daemons.

**chroot() system call:**

**What it does:** Changes the root directory to something other than the actual system root

**Example:** A program can change its root to `/var/spool/my_service` and no longer access anything outside that directory

**Tool:** There's a `chroot` program that allows you to run a program with a new root directory

**Name:** This type of isolation is sometimes called a **chroot jail** because processes can't (normally) escape it

**Resource limits (rlimit):**

**What it does:** Kernel feature that restricts how much CPU time a process can consume or how big its files can be

### 6.2. Container Definition

**Foundation:** Containers are built on these ideas—altering the environment and restricting resources with which processes run

**Loose definition:** A container is a restricted runtime environment for a set of processes, with the implication that those processes can't touch anything on the system outside that environment

**General term:** This is called **operating system–level virtualization**

:::info Single Kernel
It's important to keep in mind that a machine running one or more containers still has only **one underlying Linux kernel**. However, processes inside a container can use the user-space environment from a Linux distribution different than the underlying system.
:::

### 6.3. Key Container Features

Restrictions in containers are built with a number of kernel features:

<CardGrid
  title="Container Isolation Features"
  cards={[
    {
      title: 'Separate cgroups',
      description: 'Processes have their own control groups for resource management',
      color: colors.blue
    },
    {
      title: 'Own Devices/Filesystem',
      description: 'Isolated device access and filesystem view',
      color: colors.green
    },
    {
      title: 'Process Isolation',
      description: 'Cannot see or interact with other processes on system',
      color: colors.purple
    },
    {
      title: 'Network Interfaces',
      description: 'Separate network stack and interfaces',
      color: colors.orange
    }
  ]}
/>

### 6.4. Container Management Tools

Pulling all of these things together is a complicated task. It's possible to alter everything manually, but it can be challenging (just getting a handle on cgroups for a process is tricky).

**Popular tools:** Docker and LXC can perform the necessary subtasks of creating and managing effective containers

**Chapter focus:** This chapter focuses on Docker, but we'll also touch on LXC to see how it differs

## 7. Docker, Podman, and Privileges

To run the examples in this book, you need a container tool.

### 7.1. Docker

**What it is:** The examples here are built with Docker

**Installation:** You can normally install with a distribution package without trouble

### 7.2. Podman: The Alternative

**Primary difference:** Docker requires a server running when using containers; Podman does not

**How it affects setup:** This affects the way the two systems set up containers

**Docker privileges:** Most Docker configurations require superuser privileges to access kernel features used by containers. The `dockerd` daemon does the relevant work.

**Podman rootless:** You can run Podman as a normal user (called **rootless operation**). When run this way, it uses different techniques to achieve isolation.

**Podman as superuser:** You can also run Podman as superuser, causing it to switch over to some of Docker's isolation techniques

**Docker rootless:** Newer versions of `dockerd` support a rootless mode

### 7.3. Command-Line Compatibility

**Good news:** Podman is command-line compatible with Docker

**What this means:** You can substitute `podman` for `docker` in the examples here, and they'll still work

**Implementation differences:** There are differences, especially when running Podman in rootless mode. These will be noted where applicable.

## 8. A Docker Example

The easiest way to familiarize yourself with containers is to get hands-on.

### 8.1. Understanding Images vs. Containers

:::info Key Distinction
It's easy to confuse images and containers. Think of an **image** as the container's filesystem; processes don't run in an image, but they do run in **containers**. This is not quite accurate (when you change files in a Docker container, you aren't making changes to the image), but it's close enough for now.
:::

### 8.2. Creating an Image

#### 8.2.1. Setup

**Prerequisites:**
- Install Docker on your system (distribution's add-on package is probably fine)
- Make a new directory somewhere
- Change to that directory

#### 8.2.2. Create Dockerfile

Create a file called `Dockerfile` containing these lines:

```dockerfile
FROM alpine:latest
RUN apk add bash
CMD ["/bin/bash"]
```

**What this does:**

<ProcessFlow
  title="Dockerfile Build Steps"
  steps={[
    {
      label: 'FROM alpine:latest',
      detail: 'Uses lightweight Alpine distribution as base',
      color: colors.blue
    },
    {
      label: 'RUN apk add bash',
      detail: 'Adds bash shell (creates unique image)',
      color: colors.green
    },
    {
      label: 'CMD ["/bin/bash"]',
      detail: 'Runs bash when container starts',
      color: colors.purple
    }
  ]}
/>

**Why add bash:** Not just for usability, but also to create a unique image and see how the procedure works

**Alternative:** It's possible (and common) to use public images and make no changes. In that case, you don't need a Dockerfile.

#### 8.2.3. Build the Image

```bash
$ docker build -t hlw_test .
```

**What this does:**
- Reads the Dockerfile in the current directory
- Applies the identifier `hlw_test` to the image

:::info User Permissions
You might need to add yourself to the `docker` group on your system to run Docker commands as a regular user.
:::

### 8.3. Understanding the Build Process

Be prepared for a lot of output. Don't ignore it; reading through it helps you understand how Docker works.

#### 8.3.1. Step 1: Retrieving Base Image

```
Sending build context to Docker daemon 2.048kB
Step 1/3 : FROM alpine:latest
latest: Pulling from library/alpine
cbdbe7a5bc2a: Pull complete
Digest: sha256:9a839e63dad54c3a6d1834e29692c8492d93f90c59c978c1ed79109ea4b9a54
Status: Downloaded newer image for alpine:latest
---> f70734b6a266
```

**What's happening:**

**SHA256 digests:** Docker uses these to track many little pieces. Get used to them.

**Image identifier:** Docker created a new image with ID `f70734b6a266` for the basic Alpine distribution

**Intermediate image:** This image isn't intended as a final product—Docker will build more on top of it later

:::note Podman Output
The output is different when using Podman, but the steps are the same.
:::

#### 8.3.2. Step 2: Installing Bash

```
Step 2/3 : RUN apk add bash
---> Running in 4f0fb4632b31
fetch http://dl-cdn.alpinelinux.org/alpine/v3.11/main/x86_64/APKINDEX.tar.gz
fetch http://dl-cdn.alpinelinux.org/alpine/v3.11/community/x86_64/APKINDEX.tar.gz
(1/4) Installing ncurses-terminfo-base (6.1_p20200118-r4)
(2/4) Installing ncurses-libs (6.1_p20200118-r4)
(3/4) Installing readline (8.0.1-r0)
(4/4) Installing bash (5.0.11-r1)
Executing bash-5.0.11-r1.post-install
Executing busybox-1.31.1-r9.trigger
OK: 8 MiB in 18 packages
Removing intermediate container 4f0fb4632b31
---> 12ef4043c80a
```

**What's happening:**

You'll recognize output from the `apk add bash` command (shown in bold above).

**But how?** You probably aren't running Alpine on your machine. So how can you run the `apk` command that belongs to Alpine?

**The key:** Line saying `Running in 4f0fb4632b31`

**Temporary container:** Docker set up a new container with the intermediate Alpine image from the previous step

**Container identifier:** `4f0fb4632b31` (looks no different from image identifiers)

**Confusing terminology:** Docker calls this temporary container an **intermediate container**, which differs from an **intermediate image**

**Important distinction:** Intermediate images stay around after a build; intermediate containers do not

**What Docker did:**
1. Set up temporary container with ID `4f0fb4632b31`
2. Ran the `apk` command inside that container to install bash
3. Saved the resulting filesystem changes to a new intermediate image with ID `12ef4043c80a`
4. Removed the temporary container

#### 8.3.3. Step 3: Final Configuration

```
Step 3/3 : CMD ["/bin/bash"]
---> Running in fb082e6a0728
Removing intermediate container fb082e6a0728
---> 1b64f94e5a54
Successfully built 1b64f94e5a54
Successfully tagged hlw_test:latest
```

**What's happening:**

Docker makes the final changes required to run a bash shell when starting a container from the new image.

:::warning RUN vs. CMD
Anything done with the `RUN` command in a Dockerfile happens **during the image build**, not afterward. The `CMD` command is for the **container runtime**; this is why it occurs at the end.
:::

**Final result:**
- Image with ID `1b64f94e5a54`
- Also tagged as `hlw_test` or `hlw_test:latest`

#### 8.3.4. Verify Images

```bash
$ docker images
REPOSITORY TAG IMAGE ID CREATED SIZE
hlw_test latest 1b64f94e5a54 1 minute ago 9.19MB
alpine latest f70734b6a266 3 weeks ago 5.61MB
```

<StackDiagram
  title="Docker Image Layers"
  layers={[
    { label: 'hlw_test:latest', color: colors.purple, items: ['CMD ["/bin/bash"]', 'Final image'] },
    { label: 'Intermediate Layer', color: colors.green, items: ['Bash shell and dependencies'] },
    { label: 'alpine:latest', color: colors.blue, items: ['Base Alpine Linux distribution'] }
  ]}
/>

### 8.4. Running Docker Containers

You're now ready to start a container.

**Two ways to run:**
1. Create the container, then run something inside it (two separate steps)
2. Create and run in one step (we'll use this)

#### 8.4.1. Start a Container

```bash
$ docker run -it hlw_test
```

**Result:** You get a bash shell prompt where you can run commands in the container. The shell runs as the root user.

:::warning Important Options
If you forget the `-it` options (interactive, connect a terminal), you won't get a prompt, and the container will terminate almost immediately. These options are somewhat unusual in everyday use (especially `-t`).
:::

#### 8.4.2. Exploring the Container

If you're curious, run some commands to explore:

**Process listing:**

```bash
# ps aux

PID USER TIME COMMAND
1 root 0:00 /bin/bash
6 root 0:00 ps aux
```

**What you notice:**
- In the container, the shell is process ID 1 (normally this is init)
- Nothing else is running except the process listing you're executing

**Important fact:** These processes are simply ones visible on your normal (host) system. If you open another shell window on your host, you can find a container process in a listing:

```
root 20189 0.2 0.0 2408 2104 pts/0 Ss+ 08:36 0:00 /bin/bash
```

### 8.5. Linux Kernel Namespaces

**First encounter:** This is our first encounter with one of the kernel features used for containers: **Linux kernel namespaces** specifically for process IDs.

**How it works:**
- A process can create a whole new set of process IDs for itself and its children
- Starting at PID 1
- Those processes can see only those PIDs

### 8.6. Overlay Filesystems

Explore the filesystem in your container. You'll find it's somewhat minimal (Alpine distribution). Let's look at how the root filesystem is mounted:

```
overlay on / type overlay (rw,relatime,lowerdir=/var/lib/docker/overlay2/l/
C3D66CQYRP4SCXWFFY6HHF6X5Z:/var/lib/docker/overlay2/l/K4BLIOMNRROX3SS5GFPB
7SFISL:/var/lib/docker/overlay2/l/2MKIOXW5SUB2YDOUBNH4G4Y7KF1,upperdir=/
var/lib/docker/overlay2/d064be6692c0c6ff4a45ba9a7a02f70e2cf5810a15bcb2b728b00
dc5b7d0888c/diff,workdir=/var/lib/docker/overlay2/d064be6692c0c6ff4a45ba9a7a02
f70e2cf5810a15bcb2b728b00dc5b7d0888c/work)
```

**What this is:** An **overlay filesystem**, a kernel feature that allows you to create a filesystem by combining existing directories as layers, with changes stored in a single spot.

:::note Podman Rootless Mode
In rootless mode, Podman uses the FUSE version of the overlay filesystem. In this case, you won't see detailed information from filesystem mounts, but you can get similar information by examining `fuse-overlayfs` processes on the host system.
:::

#### 8.6.1. Understanding Overlay Components

In the mount output, you'll see three directory parameters:

**lowerdir:** Actually a colon-separated series of directories
- If you look them up on your host, you'll find the last one is the base Alpine distribution (first build step)
- The two preceding directories correspond to the other two build steps
- These directories "stack" on top of each other in order from right to left

**upperdir:** Goes on top of the lower directories
- This is where any changes to the mounted filesystem appear
- Doesn't have to be empty when you mount it
- For containers, it doesn't make sense to put anything there to start

**workdir:** A place for the filesystem driver to do its work before writing changes to the upper directory
- Must be empty upon mount

<StackDiagram
  title="Overlay Filesystem Structure"
  layers={[
    { label: 'Upper Directory (Read-Write)', color: colors.red, items: ['All container changes written here'] },
    { label: 'Lower Directory 3', color: colors.purple, items: ['CMD layer'] },
    { label: 'Lower Directory 2', color: colors.green, items: ['Bash installation layer'] },
    { label: 'Lower Directory 1 (Read-Only)', color: colors.blue, items: ['Base Alpine distribution'] }
  ]}
/>

#### 8.6.2. Managing Layer Count

**Problem:** Container images with many build steps have quite a few layers

**Strategies to minimize layers:**
- Combining RUN commands
- Multistage builds

**Note:** We won't go into details about these strategies here.

### 8.7. Networking

Although you can choose to have a container run in the same network as the host machine, you normally want some kind of isolation in the network stack for safety.

#### 8.7.1. Bridge Network (Default)

**What it is:** The default (and most common) Docker networking mode

**Technology:** Uses another kind of namespace—the **network namespace (netns)**

#### 8.7.2. Network Setup Process

**Before running anything:**

Docker creates a new network interface (usually `docker0`) on the host system.

**Typical configuration:**
- Assigned to a private network such as `172.17.0.0/16`
- Interface in this case would be assigned to `172.17.0.1`
- This network is for communication between host machine and its containers

**When creating a container:**

1. Docker creates a new network namespace (almost completely empty)
2. At first, the new namespace contains only a new, private loopback (`lo`) interface
3. To prepare the namespace for actual use, Docker creates a virtual interface on the host
4. This simulates a link between two actual network interfaces (each with its own device)
5. Places one of those devices in the new namespace
6. Configures the device in the new namespace with an address on the Docker network (`172.17.0.0/16`)
7. Processes can now send packets on that network and be received on the host

:::warning Interface Name Confusion
Different interfaces in different namespaces can have the same name. For example, the container's can be `eth0`, as well as the host machine's.
:::

#### 8.7.3. Reaching the Outside World

**Problem:** This uses a private network, and a network administrator probably wouldn't want to route anything to and from these containers blindly

**Solution:** To make it possible to reach outside hosts, the Docker network on the host configures **NAT** (Network Address Translation)

<ConnectionDiagram
  title="Docker Bridge Network Topology"
  nodes={[
    { id: 'internet', label: 'Internet', color: colors.blue },
    { id: 'host-eth', label: 'Host eth0', color: colors.green },
    { id: 'nat', label: 'NAT', color: colors.purple },
    { id: 'docker0', label: 'docker0 (172.17.0.1)', color: colors.orange },
    { id: 'veth', label: 'Virtual Interface Pair', color: colors.yellow },
    { id: 'container-eth', label: 'Container eth0 (172.17.0.2)', color: colors.teal }
  ]}
  connections={[
    { from: 'internet', to: 'host-eth', label: 'Public Network' },
    { from: 'host-eth', to: 'nat', label: 'Routes through NAT' },
    { from: 'nat', to: 'docker0', label: 'Private subnet' },
    { from: 'docker0', to: 'veth', label: 'Bridge link' },
    { from: 'veth', to: 'container-eth', label: 'Virtual bond' }
  ]}
/>

:::warning Network Subnet Clashes
You might need to examine the subnet of your Docker interface network. There can sometimes be clashes between it and the NAT-based network assigned by router hardware from telecommunications companies.
:::

#### 8.7.4. Podman Rootless Networking

**Different approach:** Rootless operation networking in Podman is different because setting up virtual interfaces requires superuser access

**Components:**
- Podman still uses a new network namespace
- Needs an interface that can be set up to operate in user space
- This is a **TAP interface** (usually at `tap0`)
- Uses a forwarding daemon called **slirp4netns**

**Capabilities:** Container processes can reach the outside world

**Limitations:** Less capable than Docker's approach. For example, containers cannot connect to one another.

**Additional topics:** There's more to networking, including how to expose ports in the container's network stack for external services, but the network topology is the most important thing to understand.

## 9. Docker Operation

At this point, we could continue discussing various other kinds of isolation and restrictions that Docker enables, but it would take a long time and you probably get the point by now.

**Key insight:** Containers don't come from one particular feature, but rather a **collection of them**.

**Consequence:** Docker must keep track of all the things we do when creating a container and must also be able to clean them up.

### 9.1. Container States

**Definition:** Docker defines a container as "running" as long as it has a process running

**Show running containers:**

```bash
$ docker ps
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
bda6204cecf7 hlw_test "/bin/bash" 8 hours ago Up 8 hours boring_lovelace
8a48d6e85efe hlw_test "/bin/bash" 20 hours ago Up 20 hours awesome_elion
```

**Exited state:** As soon as all processes terminate, Docker puts them in an exit state, but still keeps the containers (unless you start with the `--rm` option)

**What's preserved:** Changes made to the filesystem

**Access exited containers:** You can easily access the filesystem with `docker export`

### 9.2. Managing Stopped Containers

:::warning Disk Space Accumulation
You need to be aware that `docker ps` doesn't show exited containers by default; you have to use the `-a` option to see everything. It's really easy to accumulate a large pile of exited containers, and if the application creates a lot of data, you can run out of disk space and not know why.
:::

**Remove terminated containers:**

```bash
$ docker rm <container-id>
```

### 9.3. Managing Images

**Problem:** This also applies to old images. Developing an image tends to be a repetitive process

**What happens:** When you tag an image with the same tag as an existing image, Docker doesn't remove the original image. The old image simply loses that tag.

**Example showing untagged image:**

```bash
$ docker images
REPOSITORY TAG IMAGE ID CREATED SIZE
hlw_test latest 1b64f94e5a54 43 hours ago 9.19MB
<none> <none> d0461f65b379 46 hours ago 9.19MB
alpine latest f70734b6a266 4 weeks ago 5.61MB
```

**Remove an image:**

```bash
$ docker rmi <image-id>
```

**What else gets removed:** This also removes any unnecessary intermediate images that the image builds on

**Storage accumulation:** If you don't remove images, they can add up over time. Depending on what's in the images and how they're built, this can consume significant storage space.

### 9.4. Docker's Management Philosophy

**General approach:** Docker does a lot of meticulous versioning and checkpointing

**Comparison:** This layer of management reflects a particular philosophy compared to tools like LXC

## 10. Docker Service Process Models

One potentially confusing aspect of Docker containers is the lifecycle of the processes inside them.

### 10.1. Process Reaping

**Background:** Before a process can completely terminate, its parent is supposed to collect ("reap") its exit code with the `wait()` system call

**Problem in containers:** In some situations, dead processes can remain because their parents don't know how to react

**Common misconception:** This might lead you to conclude that you're not supposed to run multiple processes inside a Docker container. **This is not correct.**

### 10.2. Multiple Processes in Containers

**Truth:** You can have many processes in a container

**Example:** The shell we ran starts a new child process when you run a command

**What matters:** When you have child processes, the parent cleans up upon their exit

**Typical behavior:** Most parents do this

**Edge cases:** Certain circumstances where parent doesn't clean up, especially if it doesn't know it has children. This can happen when there are multiple levels of process spawning, and the PID 1 inside the container ends up being the parent of a child it doesn't know about.

### 10.3. Solutions for Process Management

#### 10.3.1. Using --init Option

**When to use:** If you have a simple single-minded service that spawns processes and seems to leave lingering processes even when a container should terminate

**What it does:**

```bash
$ docker run --init <image>
```

Creates a very simple init process to run as PID 1 in the container and act as a parent that knows what to do when a child process terminates.

#### 10.3.2. Using Process Management Daemon

**When to use:** Running multiple services or tasks inside a container (such as multiple workers for a job server)

**Alternative to scripts:** Instead of starting them with a script, consider using a process management daemon

**Example:** **Supervisor (supervisord)** to start and monitor services

**Benefits:**
- Provides necessary system functionality
- Gives you more control over service processes

**Consider alternatives:** If you're thinking about this kind of model for a container, there's a different option that doesn't involve Docker (see LXC section).

## 11. LXC

Our discussion has revolved around Docker because it's the most popular system for building container images and makes it very easy to get started. However, there are other packages for creating containers with different approaches.

### 11.1. What Is LXC?

**Definition:** LXC is one of the oldest container systems. In fact, the first versions of Docker were built on LXC.

**Terminology:** Sometimes used to refer to the set of kernel features that make containers possible, but most people use it to refer specifically to a library and package containing utilities for creating and manipulating Linux containers.

### 11.2. Differences from Docker

#### 11.2.1. Manual Setup

**Unlike Docker:** LXC involves a fair amount of manual setup

**Examples:**
- You have to create your own container network interface
- You need to provide user ID mappings

#### 11.2.2. Full System Approach

**Original intention:** LXC was intended to be as much of an entire Linux system as possible inside the container—init and all

**Process:** After installing a special version of a distribution, you could install everything you needed inside the container

**Similarity to Docker:** That part isn't too different from Docker

**Difference:** More setup to do. With Docker, you just download files and you're ready to go.

### 11.3. Flexibility and Granularity

**More flexible:** You might find LXC more flexible in adapting to different needs

**Example:** By default, LXC doesn't use the overlay filesystem (though you can add one)

**C API:** Because LXC is built on a C API, you can use this granularity in your own software application if necessary

### 11.4. LXD Management Layer

**What it is:** An accompanying management package

**What it does:**
- Helps work through some of LXC's finer, manual points
- Network creation
- Image management
- Offers a REST API to access LXC instead of the C API

<CardGrid
  title="Docker vs. LXC Comparison"
  cards={[
    {
      title: 'Docker',
      description: 'Automated setup, overlay filesystem, extensive image ecosystem, popular for web services, more opinionated',
      color: colors.blue
    },
    {
      title: 'LXC',
      description: 'Manual setup, flexible configuration, full system containers, C API for integration, more granular control',
      color: colors.green
    }
  ]}
/>

## 12. Kubernetes

Speaking of management, containers have become popular for many kinds of web servers. You can start a bunch of containers from a single image across multiple machines, providing excellent redundancy. Unfortunately, this can be difficult to manage.

### 12.1. Container Management Challenges

<CardGrid
  title="Container Management Tasks"
  cards={[
    {
      title: 'Machine Tracking',
      description: 'Track which machines are able to run containers',
      color: colors.blue
    },
    {
      title: 'Process Management',
      description: 'Start, monitor, and restart containers on those machines',
      color: colors.green
    },
    {
      title: 'Configuration',
      description: 'Configure container startup and networking as required',
      color: colors.purple
    },
    {
      title: 'Updates',
      description: 'Load new versions of images and update all running containers gracefully',
      color: colors.orange
    }
  ]}
/>

**Note:** This isn't a complete list, nor does it properly convey the complexity of each task.

### 12.2. Kubernetes Solution

**What it is:** Software developed by Google that has become dominant among solutions for container management

**Major factor:** Perhaps the largest contributing factor is its ability to run Docker container images

### 12.3. Kubernetes Architecture

**Two basic sides:** Much like any client-server application

**Server side:** The machine(s) available to run containers

**Client side:** Primarily a set of command-line utilities that launch and manipulate sets of containers

### 12.4. Configuration

**Complexity:** Configuration files for containers (and the groups they form) can be extensive

**Reality:** You'll quickly find that most of the work involved on the client side is creating the appropriate configuration

### 12.5. Exploring Kubernetes

**Option 1:** Set up your own servers

**Option 2 (Easier):** Use the **Minikube** tool to install a virtual machine running a Kubernetes cluster on your own machine

**Recommendation:** You can explore the configuration on your own

## 13. Pitfalls of Containers

If you think about how a service like Kubernetes works, you'll also realize that a system utilizing containers is not without its costs.

### 13.1. Infrastructure Costs

**Minimum requirement:** You still need one or more machines on which to run your containers

**Full Linux machine:** This has to be a full-fledged Linux machine, whether on real hardware or a virtual machine

**Maintenance:** There's still a maintenance cost, although it might be simpler to maintain this core infrastructure than a configuration requiring many custom software installations

**Cost forms:**

<CardGrid
  title="Infrastructure Cost Types"
  cards={[
    {
      title: 'Self-Administered',
      description: 'Significant investment of time, plus hardware, hosting, and maintenance costs',
      color: colors.red
    },
    {
      title: 'Container Service',
      description: 'Monetary cost of having someone else do the work (Kubernetes cluster, etc.)',
      color: colors.orange
    }
  ]}
/>

### 13.2. Container-Specific Considerations

:::warning Container Challenges

**Storage waste:** Containers can be wasteful in terms of storage. For any application to function, the container must include all necessary support of a Linux operating system (shared libraries, etc.). This can become quite large, especially if you don't pay attention to base distribution choice. The situation is mitigated somewhat when using overlay filesystem with several copies of the same container (shared base files). However, if your application creates lots of runtime data, upper layers of all those overlays can grow large.

**System resources:** You still have to think about CPU time and other resources. You can configure limits on what containers can consume, but you're still constrained by what the underlying system can handle. There's still a kernel and block devices. If you overload stuff, containers, the system underneath, or both will suffer.

**Data storage:** You might need to think differently about where you store data. In container systems like Docker that use overlay filesystems, changes made to the filesystem during runtime are thrown away after processes terminate. In many applications, user data goes into a database (reducing problem to database administration). But what about logs? Those are necessary for well-functioning server applications. A separate log service is a must for any substantial scale of production.

**Web server focus:** Most container tools and operation models are geared toward web servers. If you're running a typical web server, you'll find great support and information. Kubernetes has many safety features for preventing runaway server code (advantage because it compensates for poorly written web applications). However, running another kind of service can sometimes feel like driving a square peg into a round hole.

**Build quality:** Careless container builds can lead to bloat, configuration problems, and malfunction. Creating an isolated environment doesn't shield you from making mistakes in that environment. You might not have to worry about systemd intricacies, but plenty of other things can still go wrong. When problems arise, inexperienced users tend to add things haphazardly until there's a somewhat functional system—with many additional issues. You need to understand the changes you make.

**Versioning:** Can be problematic. We used the `latest` tag in examples. This is supposed to be the latest (stable) release of a container, but it also means that when you build based on the latest release, something underneath can change and break your application. Standard practice is to use a specific version tag of a base container.

**Trust:** Can be an issue, particularly for images built with Docker. When you base containers on those in the Docker image repository, you're placing trust in an additional layer of management that they haven't been altered to introduce security problems and that they'll be there when you need them. This contrasts with LXC, where you're encouraged to build your own to a certain degree.
:::

### 13.3. Balanced Perspective

When considering these issues, you might think that containers have a lot of disadvantages compared to other ways of managing system environments. However, that's not the case.

**Reality:** No matter what approach you choose, these problems are present in some degree and form—and some are easier to manage in containers.

**Important:** Containers won't solve every problem. For example, if your application takes a long time to start on a normal system (after booting), it will also start slowly in a container.

## 14. Runtime-Based Virtualization

A final kind of virtualization to mention is based on the type of environment used to develop an application.

### 14.1. How It Differs

**Not about machines:** This differs from system virtual machines and containers because it doesn't use the idea of placing applications onto different machines

**Scope:** It's a separation that applies only to a particular application

### 14.2. The Problem

**Multiple applications:** Multiple applications on the same system can use the same programming language, causing potential conflicts

**Example:** Python is used in several places on a typical distribution and can include many add-on packages

**Issue:** If you want to use the system's version of Python in your own package, you can run into trouble if you want a different version of one of the add-ons

### 14.3. Python Virtual Environments

Let's look at how Python's virtual environment feature creates a version of Python with only the packages you want.

#### 14.3.1. Creating a Virtual Environment

```bash
$ python3 -m venv test-venv
```

:::note Future Python Versions
By the time you read this, you might simply be able to type `python` instead of `python3`.
:::

#### 14.3.2. Exploring the Environment

Look inside the new `test-venv` directory. You'll see system-like directories:
- `bin`
- `include`
- `lib`

#### 14.3.3. Activating the Environment

To activate the virtual environment, you need to **source** (not execute) the `test-venv/bin/activate` script:

```bash
$ . test-venv/bin/activate
```

**Why source?** Sourcing is necessary because activation is essentially setting an environment variable, which you can't do by running an executable.

#### 14.3.4. How It Works

**What happens:**
- When you run Python, you get the version in `test-venv/bin` directory (symbolic link)
- The `VIRTUAL_ENV` environment variable is set to the environment base directory

**Deactivating:**

```bash
$ deactivate
```

**That's it:** It isn't any more complicated than that.

#### 14.3.5. Package Isolation

With the `VIRTUAL_ENV` environment variable set:
- You get a new, empty packages library in `test-venv/lib`
- Anything new you install when in the environment goes there instead of in the main system's library

<StackDiagram
  title="Python Virtual Environment Structure"
  layers={[
    { label: 'Virtual Environment Packages', color: colors.purple, items: ['test-venv/lib', 'Isolated package installation'] },
    { label: 'Python Interpreter (Symlink)', color: colors.green, items: ['test-venv/bin/python → system Python'] },
    { label: 'System Python Installation', color: colors.blue, items: ['System-wide Python and packages'] }
  ]}
/>

### 14.4. Other Languages

**Availability:** Not all programming languages allow virtual environments in the way Python does

**Why it matters:** It's worth knowing about, if for no other reason than to clear up some confusion about the word "virtual"

## 15. Summary

This chapter explored two major approaches to virtualization on Linux systems:

### 15.1. Virtual Machines

<CardGrid
  title="Virtual Machine Key Points"
  cards={[
    {
      title: 'Complete Isolation',
      description: 'Full operating system with its own kernel running on virtual hardware',
      color: colors.blue
    },
    {
      title: 'Two Hypervisor Types',
      description: 'Type 1 (bare metal) for cloud services; Type 2 (hosted) for desktop use',
      color: colors.green
    },
    {
      title: 'Hardware Support',
      description: 'Modern processors include VT-x (Intel) and AMD-V to assist virtualization',
      color: colors.purple
    },
    {
      title: 'Use Cases',
      description: 'Testing, application compatibility, cloud services, enterprise servers',
      color: colors.orange
    }
  ]}
/>

### 15.2. Containers

<CardGrid
  title="Container Key Points"
  cards={[
    {
      title: 'Lightweight',
      description: 'Share host kernel; only isolate user space, not full OS',
      color: colors.blue
    },
    {
      title: 'Multiple Technologies',
      description: 'Combine cgroups, namespaces, overlay filesystems for isolation',
      color: colors.green
    },
    {
      title: 'Popular Tools',
      description: 'Docker for application containers; LXC for system containers; Kubernetes for orchestration',
      color: colors.purple
    },
    {
      title: 'Trade-offs',
      description: 'Faster startup, less overhead, but same kernel limitations and complexity',
      color: colors.orange
    }
  ]}
/>

### 15.3. Choosing the Right Approach

**Virtual Machines:** Best when you need complete OS isolation, running different operating systems, or maximum security boundaries

**Containers:** Best when you need lightweight deployment, rapid scaling, microservices architecture, or efficient resource usage

**Runtime Virtualization:** Best when you need application-specific dependency isolation (like Python virtual environments)

**The truth:** Often, you'll use a combination of these technologies. For example, running Docker containers inside virtual machines on a cloud provider combines the benefits of both approaches.

:::tip Understanding Virtualization
The key to mastering virtualization is understanding that there's no single "best" solution. Each approach has trade-offs, and the right choice depends on your specific requirements for isolation, performance, manageability, and cost.
:::
