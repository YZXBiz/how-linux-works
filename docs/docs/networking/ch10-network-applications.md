---
sidebar_position: 2
title: "Network Applications and Services"
description: "Exploring network clients and servers, SSH, security, and debugging tools for the application layer"
---

import { ProcessFlow, StackDiagram, CardGrid, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# 10. Network Applications and Services

## 10.1. Understanding the Application Layer

**The What**: Network applications are client-server programs that operate at the top of the network stack.

**The Where**: Entirely in user space, using transport layer (TCP/UDP) provided by the kernel.

**The Why**: Applications don't need to understand packets or routing - they just read and write to network connections like files.

<StackDiagram
  title="Application Layer in the Stack"
  layers={[
    { label: 'Applications (HTTP, SSH, Email)', color: colors.blue, items: ['User space', 'What users interact with'] },
    { label: 'Transport (TCP/UDP)', color: colors.green, items: ['Kernel', 'Reliable delivery, ports'] },
    { label: 'Network (IP)', color: colors.orange, items: ['Kernel', 'Addressing, routing'] },
    { label: 'Physical (Ethernet)', color: colors.purple, items: ['Hardware + drivers'] }
  ]}
/>

### 10.1.1. Talking to a Web Server Manually

Let's see how the application layer works by manually connecting to a web server:

```bash
$ telnet example.org 80
Trying 93.184.216.34...
Connected to example.org.

GET / HTTP/1.1
Host: example.org
[press Enter twice]
```

You'll receive HTML. This demonstrates:

1. **Client** (telnet) connects to **server** (web server) on **port 80** (HTTP)
2. **Application protocol** (HTTP) defines the conversation format
3. **Transport layer** (TCP) handles the reliable connection
4. **Termination** requires explicit action (Ctrl-D)

:::tip[Understanding Protocols]
An application layer protocol is just a language. HTTP says "GET / HTTP/1.1" means "send me your homepage." SSH has its own language, as does email, FTP, and every other service.
:::

### 10.1.2. Examining HTTP with curl

**The What**: curl is a command-line tool that speaks HTTP and many other protocols.

**The Where**: Shows both the transport layer (connection) and application layer (HTTP).

**The Why**: Useful for debugging and understanding how web communication works.

```bash
# Trace the HTTP transaction
$ curl --trace-ascii trace_file http://www.example.com/

# View the trace file
$ cat trace_file
```

You'll see:

```
== Info: Trying 93.184.216.34...
== Info: Connected to www.example.com (93.184.216.34) port 80

=> Send header, 79 bytes
0000: GET / HTTP/1.1
0010: Host: www.example.com
0027: User-Agent: curl/7.58.0

<= Recv header, 17 bytes
0000: HTTP/1.1 200 OK

<= Recv data, 1256 bytes
0000: <!doctype html>
```

<ProcessFlow
  title="HTTP Request-Response"
  steps={[
    {
      name: 'TCP Connection',
      description: 'Establish connection to port 80',
      color: colors.blue
    },
    {
      name: 'Send Request',
      description: 'Client sends GET / HTTP/1.1',
      color: colors.green
    },
    {
      name: 'Receive Headers',
      description: 'Server sends response headers',
      color: colors.orange
    },
    {
      name: 'Receive Data',
      description: 'Server sends HTML document',
      color: colors.purple
    }
  ]}
/>

The key insight: Headers and data look different to curl (application), but identical to the kernel (just bytes on a TCP connection).

## 10.2. Network Servers

**The What**: Network servers are programs that listen on ports and handle incoming connections.

**The Where**: Run as daemons, usually started by systemd.

**The Why**: Provide services to network clients - web pages, file sharing, remote access, etc.

<CardGrid
  title="Common Network Servers"
  cards={[
    {
      title: 'Web Servers',
      description: 'Serve HTTP/HTTPS',
      items: ['httpd (Apache)', 'nginx', 'Port 80/443']
    },
    {
      title: 'Remote Access',
      description: 'Shell and file access',
      items: ['sshd (SSH)', 'Port 22', 'Encrypted connections']
    },
    {
      title: 'Email Servers',
      description: 'Send and receive mail',
      items: ['postfix', 'sendmail', 'Port 25/587']
    },
    {
      title: 'File Sharing',
      description: 'Share files across network',
      items: ['smbd (Windows)', 'nfsd (Unix)', 'Various ports']
    }
  ]}
/>

### 10.2.1. How Servers Handle Multiple Connections

**The What**: Servers must handle many simultaneous connections.

**The Where**: Use fork() or worker processes.

**The Why**: One connection shouldn't block others.

<ProcessFlow
  title="Typical Server Architecture"
  steps={[
    {
      name: 'Listen',
      description: 'Main process listens on port',
      color: colors.blue
    },
    {
      name: 'Accept',
      description: 'Accept incoming connection',
      color: colors.green
    },
    {
      name: 'Fork',
      description: 'Create child process for connection',
      color: colors.orange
    },
    {
      name: 'Continue',
      description: 'Parent continues listening',
      color: colors.purple
    }
  ]}
/>

Alternative: Pre-fork worker processes (Apache) or async I/O (nginx) for better performance.

## 10.3. Secure Shell (SSH)

### 10.3.1. Understanding SSH

**The What**: SSH provides secure remote access, replacing insecure telnet and rlogin.

**The Where**: Client (ssh) connects to server (sshd) on port 22.

**The Why**: Encryption protects passwords and data from eavesdropping.

<CardGrid
  title="SSH Capabilities"
  cards={[
    {
      title: 'Remote Shell',
      description: 'Interactive command line',
      items: ['ssh user@host', 'Encrypted terminal', 'Run commands remotely']
    },
    {
      title: 'File Transfer',
      description: 'Secure file copying',
      items: ['scp (copy files)', 'sftp (interactive)', 'rsync over SSH']
    },
    {
      title: 'Port Forwarding',
      description: 'Tunnel other protocols',
      items: ['Forward local ports', 'Access internal services', 'VPN-like functionality']
    },
    {
      title: 'X11 Forwarding',
      description: 'Remote GUI applications',
      items: ['Run graphical apps', 'Display on local screen', 'Encrypted graphics']
    }
  ]}
/>

### 10.3.2. Public Key Cryptography Basics

**The What**: Asymmetric encryption using paired public and private keys.

**The Where**: Public key encrypts, only private key can decrypt.

**The Why**: Solves the key distribution problem - you can share public keys freely.

Think of it like a mailbox:
- **Public key**: Anyone can drop mail in (encrypt)
- **Private key**: Only you have the key to open it (decrypt)

```bash
# Generate SSH key pair
$ ssh-keygen -t rsa -b 4096

# Public key:  ~/.ssh/id_rsa.pub  (share this)
# Private key: ~/.ssh/id_rsa      (keep secret!)
```

SSH also uses public keys for authentication:
1. Server proves its identity with its host key
2. You can prove your identity without sending your password

### 10.3.3. SSH Server Configuration

**The What**: sshd configuration controls server behavior.

**The Where**: `/etc/ssh/sshd_config`

**The Why**: Security and access control.

Key settings:

```bash
# Server listens on port 22
Port 22

# Which interfaces to listen on
#ListenAddress 0.0.0.0
#ListenAddress ::

# Host keys (server identity)
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ed25519_key

# Security settings
PermitRootLogin no          # Don't allow root login
PasswordAuthentication yes  # Allow password auth
PubkeyAuthentication yes    # Allow key-based auth

# X11 forwarding
X11Forwarding yes
```

:::warning[Security Best Practices]
- Set `PermitRootLogin no` (use sudo instead)
- Consider `PasswordAuthentication no` (keys only)
- Use fail2ban to block brute force attacks
- Keep SSH updated
:::

### 10.3.4. SSH Host Keys

**The What**: Host keys identify the server.

**The Where**: Stored in `/etc/ssh/ssh_host_*_key`

**The Why**: Prevents man-in-the-middle attacks.

<ProcessFlow
  title="First SSH Connection"
  steps={[
    {
      name: 'Connect',
      description: 'ssh user@newhost',
      color: colors.blue
    },
    {
      name: 'Unknown Host',
      description: 'Server sends its public key',
      color: colors.green
    },
    {
      name: 'User Confirms',
      description: 'Trust this fingerprint?',
      color: colors.orange
    },
    {
      name: 'Store Key',
      description: 'Save in ~/.ssh/known_hosts',
      color: colors.purple
    }
  ]}
/>

If the host key changes later, you'll see a scary warning:

```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
```

This usually means the server was rebuilt. Verify with the administrator before proceeding.

### 10.3.5. Using the SSH Client

**The What**: ssh connects to remote hosts.

**The Where**: Runs on your machine, connects to sshd on remote host.

**The Why**: Access remote systems securely.

```bash
# Basic login
$ ssh user@remotehost

# Run a command remotely
$ ssh user@remotehost ls -l /tmp

# Use a pipeline
$ tar zcvf - mydir | ssh remotehost tar zxvf -
```

### 10.3.6. SSH File Transfer

<CardGrid
  title="SSH File Transfer Tools"
  cards={[
    {
      title: 'scp (Simple Copy)',
      description: 'Copy files like cp',
      items: ['scp file user@host:', 'scp user@host:file .', 'One-shot transfers']
    },
    {
      title: 'sftp (Interactive)',
      description: 'Like old FTP client',
      items: ['sftp user@host', 'get, put, ls, cd', 'Interactive session']
    },
    {
      title: 'rsync (Sync)',
      description: 'Efficient synchronization',
      items: ['rsync -av dir/ host:dest/', 'Only transfers differences', 'Best for large transfers']
    }
  ]}
/>

```bash
# Copy local file to remote host
$ scp document.pdf user@host:~/documents/

# Copy remote file to local
$ scp user@host:~/data.txt .

# Copy between two remote hosts
$ scp user1@host1:file user2@host2:destination
```

### 10.3.7. fail2ban: Blocking Brute Force Attacks

**The What**: fail2ban monitors logs and blocks repeated login failures.

**The Where**: Watches /var/log/auth.log, creates iptables rules.

**The Why**: SSH servers face constant password-guessing attacks.

How it works:

<ProcessFlow
  title="fail2ban Protection"
  steps={[
    {
      name: 'Monitor Logs',
      description: 'Watch for failed SSH attempts',
      color: colors.blue
    },
    {
      name: 'Count Failures',
      description: '5 failures from 192.168.1.100',
      color: colors.green
    },
    {
      name: 'Block IP',
      description: 'Add iptables DROP rule',
      color: colors.orange
    },
    {
      name: 'Auto-Unblock',
      description: 'Remove block after 10 minutes',
      color: colors.purple
    }
  ]}
/>

Most distributions offer a fail2ban package with SSH protection pre-configured.

## 10.4. Diagnostic Tools

### 10.4.1. netstat: Network Statistics

**The What**: View network connections, listening ports, and statistics.

**The Where**: Queries kernel network data structures.

**The Why**: See what's happening on your network.

<CardGrid
  title="Common netstat Options"
  cards={[
    {
      title: 'netstat -nt',
      description: 'Active TCP connections',
      items: ['-n: numeric (no DNS)', '-t: TCP only', 'See established connections']
    },
    {
      title: 'netstat -ntl',
      description: 'Listening ports',
      items: ['-l: listening only', 'See running servers', 'Find what is listening']
    },
    {
      title: 'netstat -ntu',
      description: 'All TCP and UDP',
      items: ['-u: include UDP', 'See all protocols', 'Complete view']
    }
  ]}
/>

```bash
# View active connections
$ netstat -nt
Proto Local Address         Foreign Address       State
tcp   10.23.2.4:47626      10.194.79.125:5222   ESTABLISHED
tcp   10.23.2.4:41475      172.19.52.144:6667   ESTABLISHED

# View listening ports
$ netstat -ntl
Proto Local Address         State
tcp   0.0.0.0:22           LISTEN
tcp   0.0.0.0:80           LISTEN
tcp   127.0.0.53:53        LISTEN
```

### 10.4.2. lsof: List Open Files (Including Sockets)

**The What**: Shows which processes are using network ports.

**The Where**: Examines kernel file descriptor tables.

**The Why**: Find what program is listening on a port.

```bash
# View all network usage
# lsof -i

# Find what is using port 80
# lsof -i:80

# Filter by TCP
# lsof -iTCP -sTCP:LISTEN

# Disable DNS lookups (faster)
# lsof -n -i
```

Example output:

```
COMMAND    PID  USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
ssh      14366 juser   3u  IPv4 38995911      0t0  TCP thishost:55457->somehost:ssh (ESTABLISHED)
chromium 26534 juser   8r  IPv4 42525253      0t0  TCP thishost:41551->example.com:https (ESTABLISHED)
```

This shows:
- **ssh**: Process name
- **14366**: Process ID
- **juser**: User running it
- **thishost:55457**: Local address and ephemeral port
- **somehost:ssh**: Remote host and service

:::tip[Finding Port Users]
Can't start a server because "address already in use"? Use `lsof -i:PORT` to find what's using it.
:::

### 10.4.3. tcpdump: Packet Capture

**The What**: Captures and displays network packets.

**The Where**: Puts network interface in promiscuous mode.

**The Why**: See exactly what's on the wire for debugging.

```bash
# Capture all packets (warning: lots of output!)
# tcpdump

# Capture only TCP
# tcpdump tcp

# Capture web traffic (port 80 and 443)
# tcpdump 'tcp port 80 or tcp port 443'

# Capture from specific host
# tcpdump host 10.23.2.5

# Save to file for later analysis
# tcpdump -w capture.pcap
```

<CardGrid
  title="tcpdump Filters"
  cards={[
    {
      title: 'Protocol Filters',
      description: 'Filter by protocol',
      items: ['tcp', 'udp', 'icmp', 'ip6']
    },
    {
      title: 'Host Filters',
      description: 'Filter by address',
      items: ['host 10.1.2.3', 'src host 10.1.2.3', 'dst host 10.1.2.3']
    },
    {
      title: 'Port Filters',
      description: 'Filter by port',
      items: ['port 80', 'portrange 80-443', 'not port 22']
    },
    {
      title: 'Network Filters',
      description: 'Filter by subnet',
      items: ['net 10.23.2.0/24', 'src net 192.168.0.0/16']
    }
  ]}
/>

:::danger[Privacy Warning]
tcpdump can see all network traffic, including sensitive data. Only use it on networks you own or have permission to monitor. Consider using Wireshark for a GUI alternative.
:::

### 10.4.4. netcat: The Network Swiss Army Knife

**The What**: Versatile tool for reading/writing network connections.

**The Where**: Works with any TCP or UDP port.

**The Why**: Testing, debugging, and simple server tasks.

```bash
# Connect to a port (like telnet)
$ netcat www.example.com 80
GET / HTTP/1.1
Host: www.example.com

# Listen on a port
$ netcat -l 8080
# Now connect from another machine to test connectivity

# Transfer a file
# On receiver:
$ netcat -l 9999 > received_file

# On sender:
$ netcat receiver_host 9999 < file_to_send

# Port scanning (use nmap instead for serious work)
$ netcat -zv example.com 20-100
```

Options:
- `-l`: Listen mode (be a server)
- `-u`: UDP instead of TCP
- `-v`: Verbose output
- `-z`: Scan mode (no data transfer)

### 10.4.5. nmap: Port Scanning

**The What**: Network exploration and security auditing tool.

**The Where**: Scans hosts to find open ports and services.

**The Why**: Discover what services are running.

```bash
# Scan a single host
$ nmap 10.1.2.2

# Scan with service detection
$ nmap -sV 10.1.2.2

# Scan IPv6
$ nmap -6 example.com

# Scan a subnet
$ nmap 10.1.2.0/24
```

Example output:

```
Starting Nmap 7.80 ( https://nmap.org )
Nmap scan report for 10.1.2.2
Host is up (0.00027s latency).
Not shown: 993 closed ports
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https
111/tcp  open  rpcbind
```

:::warning[Get Permission]
Port scanning networks you don't own can be illegal and will get you blocked. Always get permission before scanning.
:::

## 10.5. Pre-systemd Network Servers: inetd/xinetd

**The What**: Superservers that listen on multiple ports and launch services on demand.

**The Where**: Now mostly replaced by systemd socket units.

**The Why**: Historical context - you might see this on older systems.

The idea:
- One daemon (inetd) listens on many ports
- When connection arrives, inetd starts the appropriate server
- Server handles connection and exits
- Saves resources when services are rarely used

Mostly obsolete now, replaced by systemd's more integrated approach.

## 10.6. Remote Procedure Call (RPC)

**The What**: System for programs to call functions on remote machines.

**The Where**: Sits between transport and application layers.

**The Why**: Simplifies writing distributed applications.

```bash
# View RPC services
$ rpcinfo -p localhost
```

RPC is used by:
- **NFS**: Network File System
- **NIS**: Network Information Service

Most modern systems avoid RPC when possible - it's complex and has security issues.

## 10.7. Network Security

### 10.7.1. Security Principles

**The What**: Protecting your machine from network attacks.

**The Where**: Multiple layers - firewall, services, authentication.

**The Why**: The internet is hostile - automated attacks are constant.

<CardGrid
  title="Security Best Practices"
  cards={[
    {
      title: 'Minimize Services',
      description: 'Run only what you need',
      items: ['Disable unused services', 'Smaller attack surface', 'Easier to maintain']
    },
    {
      title: 'Use Firewalls',
      description: 'Block unwanted traffic',
      items: ['iptables/nftables', 'Block at router too', 'Default deny policy']
    },
    {
      title: 'Keep Updated',
      description: 'Patch vulnerabilities',
      items: ['Enable automatic updates', 'Subscribe to security lists', 'Use LTS distributions']
    },
    {
      title: 'Limit Access',
      description: 'Principle of least privilege',
      items: ['Minimal user accounts', 'Strong passwords/keys', 'No unnecessary root access']
    }
  ]}
/>

### 10.7.2. Types of Attacks

<ProcessFlow
  title="Common Attack Patterns"
  steps={[
    {
      name: 'Port Scanning',
      description: 'Attacker finds open ports',
      color: colors.blue
    },
    {
      name: 'Service Exploit',
      description: 'Exploit vulnerability in service',
      color: colors.green
    },
    {
      name: 'Gain Access',
      description: 'Get shell or install backdoor',
      color: colors.orange
    },
    {
      name: 'Privilege Escalation',
      description: 'Become root',
      color: colors.purple
    }
  ]}
/>

**Full Compromise**: Attacker gains root access
- Buffer overflow exploits (less common now due to ASLR)
- Service vulnerabilities
- Privilege escalation from user account

**Denial of Service (DoS)**: Make service unavailable
- Flood of requests
- Exploit crash bug
- Easier to launch than prevent

**Malware**: Malicious software
- Less common on Linux than Windows
- Still exists (trojans, rootkits)
- Never install random software

### 10.7.3. Vulnerable Services (Disable These!)

**The What**: Services with known security problems.

**The Where**: Legacy services still on some systems.

**The Why**: Cleartext passwords, buffer overflows, poor design.

Never run these:

```
ftpd        - FTP server (cleartext passwords, many exploits)
telnetd     - Telnet server (no encryption)
rlogind     - Remote login (no encryption)
rexecd      - Remote execution (no encryption)
```

Use these instead:
- **SSH** instead of telnet/rlogin
- **SFTP** or **rsync** instead of FTP
- **SSH** for remote execution

### 10.7.4. Encryption: TLS/SSL

**The What**: Transport Layer Security (TLS) encrypts application data.

**The Where**: Between application and transport layers.

**The Why**: Prevents eavesdropping on network traffic.

Common TLS uses:
- **HTTPS**: HTTP over TLS (port 443)
- **SMTPS**: Email over TLS (port 465)
- **IMAPS**: IMAP over TLS (port 993)

TLS provides:
- **Encryption**: Others can't read the data
- **Authentication**: Verify server identity (via certificates)
- **Integrity**: Detect tampering

:::tip[Assume Unencrypted is Visible]
Anything sent without encryption (TLS, SSH, VPN) should be considered public. This includes:
- HTTP (not HTTPS) web traffic
- Unencrypted email
- FTP transfers
- Telnet sessions
:::

### 10.7.5. Security Resources

**The What**: Where to learn about security issues.

**The Where**: Trusted security organizations and researchers.

**The Why**: Stay informed about vulnerabilities affecting your systems.

Key resources:
- **SANS Institute** (sans.org): Training, newsletters, security policy examples
- **CERT** (cert.org): Critical vulnerabilities and advisories
- **Insecure.org**: Nmap and security tools
- **CVE Database** (cve.org): Common vulnerabilities catalog

## 10.8. Network Sockets (Advanced)

### 10.8.1. Understanding Sockets

**The What**: Sockets are the interface between user space and kernel networking.

**The Where**: Applications use socket system calls to access the network.

**The Why**: Provides a file-like interface for network communication.

```c
// Simplified socket usage (C code)
int sock = socket(AF_INET, SOCK_STREAM, 0);  // Create
connect(sock, &addr, sizeof(addr));          // Connect
write(sock, data, len);                      // Send
read(sock, buffer, bufsize);                 // Receive
close(sock);                                 // Close
```

Socket types:
- **SOCK_STREAM**: TCP (reliable, ordered)
- **SOCK_DGRAM**: UDP (unreliable, message-based)

### 10.8.2. Server Socket Flow

<ProcessFlow
  title="TCP Server with Sockets"
  steps={[
    {
      name: 'Create & Bind',
      description: 'Create listening socket on port',
      color: colors.blue
    },
    {
      name: 'Listen',
      description: 'Mark socket as accepting connections',
      color: colors.green
    },
    {
      name: 'Accept',
      description: 'Wait for and accept connection',
      color: colors.orange
    },
    {
      name: 'Fork/Handle',
      description: 'Process connection (possibly fork)',
      color: colors.purple
    }
  ]}
/>

The listening socket and connection sockets are different:
- **Listening socket**: Waits for new connections
- **Connection socket**: Handles specific connection

## 10.9. Unix Domain Sockets

### 10.9.1. Understanding Unix Sockets

**The What**: Sockets for local inter-process communication (IPC).

**The Where**: No network - processes on same machine.

**The Why**: Faster than network sockets, can use filesystem permissions.

```bash
# List Unix domain sockets in use
# lsof -U

COMMAND   PID  USER   FD   TYPE     DEVICE SIZE/OFF NODE NAME
mysqld  19701 mysql   12u  unix 0xe4defcc0      0t0 35201227 /var/run/mysqld/mysqld.sock
```

Benefits:
- **Performance**: No network stack overhead
- **Security**: Filesystem permissions control access
- **Simplicity**: No ports to manage

Common uses:
- **D-Bus**: System message bus
- **MySQL**: Local database connections
- **Docker**: Container communication
- **X11**: GUI application connections

Example socket file:

```bash
$ ls -l /var/run/dbus/system_bus_socket
srwxrwxrwx 1 root root 0 Nov 9 08:52 /var/run/dbus/system_bus_socket
```

The `s` at the start indicates a socket file.

## 10.10. Summary

You've learned the application layer - where network services actually get work done:

<CardGrid
  title="Key Concepts"
  cards={[
    {
      title: 'Client-Server Model',
      description: 'How applications communicate',
      items: ['Clients initiate connections', 'Servers listen on well-known ports', 'Multiple connections via fork/threads']
    },
    {
      title: 'SSH is Essential',
      description: 'Secure remote access',
      items: ['Replaces insecure telnet', 'Encryption protects data', 'Keys better than passwords']
    },
    {
      title: 'Debugging Tools',
      description: 'Understanding what is happening',
      items: ['netstat (connections)', 'lsof (port usage)', 'tcpdump (packets)']
    },
    {
      title: 'Security Matters',
      description: 'Protection is essential',
      items: ['Minimize services', 'Use firewalls', 'Keep systems updated']
    }
  ]}
/>

The layers work together:

1. **Application**: HTTP, SSH, DNS (this chapter)
2. **Transport**: TCP ports, UDP (Chapter 9)
3. **Network**: IP addresses, routing (Chapter 9)
4. **Physical**: Ethernet, WiFi (Chapter 9)

Understanding each layer helps you debug problems and secure your systems. The next chapter will cover file sharing and transfer tools like rsync, NFS, and Samba.
