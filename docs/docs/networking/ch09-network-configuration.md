---
sidebar_position: 1
title: "Network Configuration"
description: "Understanding how Linux networks work, from physical layers to IP addressing, routing, and configuration tools"
---

import { ProcessFlow, StackDiagram, CardGrid, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# 9. Understanding Your Network and Its Configuration

## 9.1. Network Basics

Networking connects computers and sends data between them. To understand how this works, you need to answer two fundamental questions:

**The What**: How does the computer sending data know where to send it?

**The Where**: When the destination receives data, how does it know what it just received?

**The Why**: Linux answers these questions using network layers that stack on top of each other, forming a complete system.

### 9.1.1. Understanding Network Layers

<StackDiagram
  title="The Network Stack"
  layers={[
    { title: 'Application Layer', color: colors.blue, items: ['HTTP, FTP, SSH', 'User space protocols'] },
    { title: 'Transport Layer', color: colors.green, items: ['TCP, UDP', 'Ports and connections'] },
    { title: 'Network Layer', color: colors.orange, items: ['IP addressing', 'Routing'] },
    { title: 'Physical Layer', color: colors.purple, items: ['Ethernet', 'MAC addresses'] }
  ]}
/>

Each layer has a specific job. The physical layer handles raw transmission over wires or wireless. The network layer handles addressing (IP addresses). The transport layer handles reliable delivery. The application layer handles what programs actually communicate.

:::tip[Understanding Layer Independence]
Each layer is independent. You can change the physical layer (from wired to wireless) without changing the application layer. This flexibility is why the internet works on any hardware.
:::

### 9.1.2. Your First Network: The LAN

**The What**: A local area network (LAN) connects machines in a small area with a router providing internet access.

**The Where**: The router connects your LAN to the Wide Area Network (WAN) - the internet.

**The Why**: This design lets multiple machines share one internet connection while maintaining local communication.

<ConnectionDiagram
  title="Typical Home/Office Network"
  layout="hub"
  nodes={[
    { id: 'router', label: 'Router (10.23.2.1)', color: colors.blue, icon: '🌐' },
    { id: 'internet', label: 'Internet', color: colors.purple },
    { id: 'hostA', label: 'Host A (10.23.2.4)', color: colors.green },
    { id: 'hostB', label: 'Host B (10.23.2.5)', color: colors.green },
    { id: 'hostC', label: 'Host C (10.23.2.6)', color: colors.green }
  ]}
  connections={[
    { from: 'router', to: 'internet', label: 'WAN' },
    { from: 'router', to: 'hostA', label: 'LAN' },
    { from: 'router', to: 'hostB', label: 'LAN' },
    { from: 'router', to: 'hostC', label: 'LAN' }
  ]}
/>

## 9.2. Packets: How Data Travels

**The What**: Networks transmit data in small chunks called packets.

**The Where**: Each packet contains a header (addressing information) and payload (actual data).

**The Why**: Breaking messages into packets allows multiple hosts to communicate simultaneously, makes error detection easier, and enables efficient network use.

Think of packets like postal mail. The envelope (header) has addressing information. The letter inside (payload) is the actual message. Different letters can travel different routes and arrive in any order.

:::info[Packet Independence]
Your operating system handles translating between application data and packets. You rarely need to worry about individual packets - the OS does this for you.
:::

## 9.3. The Internet Layer: IP Addresses

### 9.3.1. Understanding IPv4 Addresses

**The What**: An IPv4 address is a unique identifier in dotted-quad notation (e.g., 10.23.2.37).

**The Where**: Each address consists of 4 bytes, written as a.b.c.d, where each part is 0-255.

**The Why**: Addresses let machines find each other across the entire internet, similar to postal addresses.

```bash
# View your IP addresses
$ ip address show
```

You'll see output like:

```
inet 10.23.2.4/24 brd 10.23.2.255 scope global enp0s31f6
```

The address `10.23.2.4` is your machine's IP. The `/24` describes your subnet (explained next).

:::warning[Multiple Addresses]
One machine can have many IP addresses - one per network interface, plus virtual addresses. This is normal and allows complex networking scenarios.
:::

### 9.3.2. Subnets: Organizing the Network

**The What**: A subnet is a group of IP addresses in a particular range, typically on the same physical network.

**The Where**: Subnets are defined by a network prefix (like 10.23.2.0) and subnet mask (like 255.255.255.0).

**The Why**: Subnets organize networks into manageable chunks and determine which hosts can communicate directly.

#### Understanding Subnet Masks

Let's decode `10.23.2.0/24`:

```
IP Address:    10.23.2.4     = 00001010 00010111 00000010 00000100
Subnet Mask:   255.255.255.0 = 11111111 11111111 11111111 00000000
                                ^^^^^^^^ ^^^^^^^^ ^^^^^^^^
                                These bits identify the subnet
```

The `/24` means the first 24 bits identify the subnet. The remaining 8 bits identify individual hosts.

<CardGrid
  title="Common Subnet Masks"
  cards={[
    {
      title: '/8 (255.0.0.0)',
      description: '16.7 million addresses',
      items: ['Large organizations', 'Example: 10.0.0.0/8']
    },
    {
      title: '/16 (255.255.0.0)',
      description: '65,536 addresses',
      items: ['Medium networks', 'Example: 192.168.0.0/16']
    },
    {
      title: '/24 (255.255.255.0)',
      description: '254 addresses',
      items: ['Most common for LANs', 'Example: 10.23.2.0/24']
    },
    {
      title: '/26 (255.255.255.192)',
      description: '62 addresses',
      items: ['Small networks', 'Example: 192.168.1.0/26']
    }
  ]}
/>

## 9.4. Routes and the Kernel Routing Table

**The What**: Routes tell the kernel where to send packets for different destinations.

**The Where**: The routing table stores these rules in the kernel.

**The Why**: Without routes, your machine wouldn't know how to reach other networks.

### 9.4.1. Viewing Routes

```bash
# View the routing table
$ ip route show
default via 10.23.2.1 dev enp0s31f6
10.23.2.0/24 dev enp0s31f6 proto kernel scope link src 10.23.2.4
```

Let's decode this:

**First line (default route)**: Send anything not matching other rules to 10.23.2.1 (the router).

**Second line (local subnet)**: Send anything in 10.23.2.0/24 directly through the network interface.

<CardGrid
  columns={2}
  cards={[
    { title: 'Direct Route', description: '10.23.2.4 → 10.23.2.5', color: colors.green, items: ['Same subnet', 'No router needed'] },
    { title: 'Gateway Route', description: '10.23.2.4 → Router → Internet', color: colors.blue, items: ['Different subnet', 'Via 10.23.2.1'] }
  ]}
/>

### 9.4.2. The Default Gateway

**The What**: The default gateway is where packets go when no other route matches.

**The Where**: Usually the router at address .1 of your subnet (e.g., 10.23.2.1 for 10.23.2.0/24).

**The Why**: Without a default gateway, you can only reach hosts on your local subnet.

:::info[Route Matching]
When multiple routes match, the kernel uses the longest (most specific) prefix. A route to 10.23.2.0/24 (24 bits) beats the default route 0.0.0.0/0 (0 bits).
:::

## 9.5. IPv6: The Future of Addressing

### 9.5.1. Understanding IPv6 Addresses

**The What**: IPv6 uses 128-bit addresses (vs. IPv4's 32 bits), written in hexadecimal.

**The Where**: Format is `2001:0db8:0a0b:12f0:0000:0000:0000:8b6e`.

**The Why**: IPv4's 4.3 billion addresses aren't enough. IPv6 provides 340 undecillion addresses.

#### IPv6 Address Abbreviation

Full form:
```
2001:0db8:0a0b:12f0:0000:0000:0000:8b6e
```

Abbreviated (drop leading zeros, :: for contiguous zeros):
```
2001:db8:a0b:12f0::8b6e
```

### 9.5.2. IPv6 Address Types

<CardGrid
  title="IPv6 Address Types"
  cards={[
    {
      title: 'Global Unicast',
      description: 'Valid across internet',
      items: ['Starts with 2 or 3', 'Example: 2001:db8:8500::1', 'Like public IPv4']
    },
    {
      title: 'Link-Local',
      description: 'Valid on local network only',
      items: ['Always fe80::/64', 'Example: fe80::d05c:97f9:7be8:bca', 'Like 169.254.x.x in IPv4']
    },
    {
      title: 'Loopback',
      description: 'This machine only',
      items: ['Address: ::1', 'Like 127.0.0.1', 'Never leaves the host']
    }
  ]}
/>

```bash
# View IPv6 configuration
$ ip -6 address show
inet6 2001:db8:8500:e:52b6:59cc:74e9:8b6e/64 scope global
inet6 fe80::d05c:97f9:7be8:bca/64 scope link
```

## 9.6. Basic Network Tools

### 9.6.1. ping: Testing Connectivity

**The What**: ping sends ICMP echo requests to test if a host is reachable.

**The Where**: It works at the network layer (IP).

**The Why**: Quick way to verify connectivity and measure round-trip time.

```bash
# Test connectivity
$ ping 10.23.2.1
PING 10.23.2.1 (10.23.2.1) 56(84) bytes of data.
64 bytes from 10.23.2.1: icmp_req=1 ttl=64 time=1.76 ms
64 bytes from 10.23.2.1: icmp_req=2 ttl=64 time=2.35 ms
```

Key indicators:
- **No response**: Host down or blocking ping
- **High time (>100ms on LAN)**: Network congestion
- **Gaps in sequence**: Packet loss

### 9.6.2. DNS and the host Command

**The What**: DNS translates names (www.example.com) to IP addresses.

**The Where**: DNS is an application layer service.

**The Why**: Nobody wants to remember IP addresses.

```bash
# Look up an IP address
$ host www.example.com
example.com has address 93.184.216.34
example.com has IPv6 address 2001:db8:220:1:248:1893:25c8:1946

# Reverse lookup (less reliable)
$ host 93.184.216.34
```

## 9.7. The Physical Layer: Ethernet

**The What**: Ethernet is the physical layer - how bits actually move over wires or wireless.

**The Where**: Every Ethernet device has a unique MAC address (e.g., 10:78:d2:eb:76:97).

**The Why**: The physical layer handles actual transmission, while IP handles logical addressing.

### 9.7.1. Understanding MAC Addresses

MAC addresses are hardware addresses, independent of IP addresses. Think of IP as your mailing address (changes when you move) and MAC as your fingerprint (never changes).

```bash
# View MAC addresses
$ ip address show
link/ether 40:8d:5c:fc:24:1f brd ff:ff:ff:ff:ff:ff
inet 10.23.2.4/24
```

:::warning[Layer Separation]
IP packets travel across many Ethernet segments to reach their destination. Each segment uses different MAC addresses, but the IP addresses in the packet never change.
:::

## 9.8. Network Interfaces

### 9.8.1. Understanding Interface Names

**The What**: A network interface connects IP (software) to Ethernet (hardware).

**The Where**: Interfaces have names like `enp0s31f6` (predictable) or `eth0` (traditional).

**The Why**: One machine can have multiple interfaces (wired, wireless, virtual).

```bash
# List all interfaces
$ ip link show
1: lo: <LOOPBACK,UP,LOWER_UP>
2: enp0s31f6: <BROADCAST,MULTICAST,UP,LOWER_UP>
```

<CardGrid
  title="Interface Name Patterns"
  cards={[
    {
      title: 'Predictable Names',
      description: 'Modern systemd naming',
      items: ['enp0s31f6 (PCI Ethernet)', 'wlp1s0 (PCI Wireless)', 'Names persist across reboots']
    },
    {
      title: 'Traditional Names',
      description: 'Legacy naming',
      items: ['eth0, eth1 (Ethernet)', 'wlan0 (Wireless)', 'May change on reboot']
    },
    {
      title: 'Special Interfaces',
      description: 'Virtual interfaces',
      items: ['lo (loopback)', 'docker0 (Docker)', 'tun0 (VPN)']
    }
  ]}
/>

## 9.9. Network Configuration

### 9.9.1. Manual Configuration (For Testing)

**The What**: You can manually configure interfaces for testing.

**The Where**: Use the `ip` command to configure kernel networking.

**The Why**: Understanding manual configuration helps debug automatic systems.

```bash
# Add an IP address to an interface
# ip address add 10.23.2.4/24 dev enp0s31f6

# Add a default route
# ip route add default via 10.23.2.1 dev enp0s31f6

# Remove a route
# ip route del default
```

:::danger[Manual Configuration]
Manual configuration is lost on reboot. Use NetworkManager or systemd-networkd for persistent configuration. Only configure manually when experimenting.
:::

### 9.9.2. Automatic Configuration with DHCP

**The What**: DHCP automatically assigns IP addresses, subnet masks, gateways, and DNS servers.

**The Where**: A DHCP server (usually the router) provides configuration.

**The Why**: Automatic configuration prevents conflicts and simplifies network management.

<ProcessFlow
  title="DHCP Process"
  steps={[
    {
      name: 'Discovery',
      description: 'Client broadcasts "I need an IP address"',
      color: colors.blue
    },
    {
      name: 'Offer',
      description: 'Server offers an IP address lease',
      color: colors.green
    },
    {
      name: 'Request',
      description: 'Client requests the offered address',
      color: colors.orange
    },
    {
      name: 'Acknowledge',
      description: 'Server confirms the lease',
      color: colors.purple
    }
  ]}
/>

The DHCP client (dhclient or systemd-networkd) handles this automatically when your interface comes up.

## 9.10. NetworkManager

### 9.10.1. Understanding NetworkManager

**The What**: NetworkManager is a daemon that automatically configures and manages network interfaces.

**The Where**: It runs as a system service, monitoring hardware and managing connections.

**The Why**: Modern networks are dynamic - NetworkManager handles complexity like switching between wired and wireless.

```bash
# View connection status
$ nmcli

# List available networks
$ nmcli device wifi list

# Check if network is up
$ nm-online && echo "Network is up"
```

### 9.10.2. How NetworkManager Makes Decisions

<ProcessFlow
  title="NetworkManager Decision Process"
  steps={[
    {
      name: 'Detect Hardware',
      description: 'Monitor network devices via udev',
      color: colors.blue
    },
    {
      name: 'Check Connections',
      description: 'Look for known networks',
      color: colors.green
    },
    {
      name: 'Prioritize',
      description: 'Wired first, then most recent wireless',
      color: colors.orange
    },
    {
      name: 'Configure',
      description: 'Run DHCP, set routes, update DNS',
      color: colors.purple
    }
  ]}
/>

NetworkManager delegates actual work to specialized tools:
- **dhclient**: DHCP leases
- **wpa_supplicant**: Wireless security
- **systemd-resolved**: DNS caching

## 9.11. DNS Resolution

### 9.11.1. How Name Resolution Works

**The What**: DNS translates hostnames to IP addresses.

**The Where**: Configuration in `/etc/resolv.conf`, `/etc/hosts`, and systemd-resolved.

**The Why**: Humans remember names better than numbers.

<ProcessFlow
  title="DNS Lookup Process"
  steps={[
    {
      name: 'Check /etc/hosts',
      description: 'Local overrides first',
      color: colors.blue
    },
    {
      name: 'Check Cache',
      description: 'systemd-resolved cache',
      color: colors.green
    },
    {
      name: 'Query DNS',
      description: 'Ask configured nameserver',
      color: colors.orange
    },
    {
      name: 'Return Result',
      description: 'Give IP to application',
      color: colors.purple
    }
  ]}
/>

```bash
# View DNS settings
$ resolvectl status

# Check which nameservers are configured
$ cat /etc/resolv.conf
```

### 9.11.2. Local Name Resolution

The `/etc/hosts` file provides manual overrides:

```
127.0.0.1       localhost
10.23.2.3       atlantic.example.com atlantic
10.23.2.4       pacific.example.com pacific
::1             localhost ip6-localhost
```

:::tip[When to Use /etc/hosts]
Use /etc/hosts for:
- localhost (always)
- A few local machines on small networks
- Temporary overrides for testing

Do NOT use it for:
- Hosts with DNS entries (will cause confusion)
- Large numbers of hosts (unmaintainable)
:::

## 9.12. The Transport Layer: TCP and UDP

### 9.12.1. Understanding TCP Ports

**The What**: TCP provides reliable connections using port numbers.

**The Where**: Ports are 16-bit numbers (1-65535) used with IP addresses.

**The Why**: Ports let multiple applications use the network simultaneously.

```bash
# View active TCP connections
$ netstat -nt
Proto Local Address           Foreign Address         State
tcp   10.23.2.4:47626        10.194.79.125:5222     ESTABLISHED
tcp   10.23.2.4:41475        172.19.52.144:6667     ESTABLISHED
```

Reading this:
- **Local Address**: Your machine's IP and port
- **Foreign Address**: Remote machine's IP and port
- **State**: Connection status

<CardGrid
  title="Port Categories"
  cards={[
    {
      title: 'System Ports (1-1023)',
      description: 'Well-known services',
      items: ['Require root to listen', 'SSH: 22, HTTP: 80, HTTPS: 443', 'Defined in /etc/services']
    },
    {
      title: 'User Ports (1024-49151)',
      description: 'Registered services',
      items: ['Any user can listen', 'Many applications use these', 'Some are well-known']
    },
    {
      title: 'Dynamic Ports (49152-65535)',
      description: 'Ephemeral ports',
      items: ['Temporary client connections', 'Automatically assigned', 'Released after use']
    }
  ]}
/>

### 9.12.2. Listening on Ports

```bash
# View listening ports
$ netstat -ntl
Proto Local Address           State
tcp   0.0.0.0:80             LISTEN
tcp   0.0.0.0:443            LISTEN
tcp   127.0.0.53:53          LISTEN
```

- `0.0.0.0:80`: Listening on all interfaces, port 80 (HTTP)
- `127.0.0.53:53`: Listening only on localhost, port 53 (DNS)

:::info[TCP vs UDP]
**TCP**: Connection-oriented, reliable, like a phone call
- Guaranteed delivery
- In-order packets
- Examples: HTTP, SSH, email

**UDP**: Connectionless, fast, like sending postcards
- No delivery guarantee
- Faster than TCP
- Examples: DNS queries, video streaming, VoIP
:::

## 9.13. The Loopback Interface

**The What**: The loopback interface (lo) is a virtual network interface that loops back to the same machine.

**The Where**: Address 127.0.0.1 (IPv4) or ::1 (IPv6).

**The Why**: Allows programs to communicate using network protocols without leaving the machine.

```bash
$ ip address show lo
1: lo: <LOOPBACK,UP,LOWER_UP>
    inet 127.0.0.1/8 scope host lo
    inet6 ::1/128 scope host
```

Common uses:
- **Development**: Test network applications locally
- **Services**: Many daemons communicate via localhost
- **Security**: Services only accessible from this machine

:::tip[Localhost Address Range]
Any address starting with 127 (like 127.0.0.53) is localhost. This lets different services use different addresses without conflicts.
:::

## 9.14. Private Networks and NAT

### 9.14.1. Private IP Address Ranges

**The What**: Private networks use addresses that aren't routable on the public internet.

**The Where**: Defined in RFC 1918.

**The Why**: Conserves public IPv4 addresses, provides security through isolation.

<CardGrid
  title="Private Address Ranges"
  cards={[
    {
      title: '10.0.0.0/8',
      description: '16.7 million addresses',
      items: ['10.0.0.0 - 10.255.255.255', 'Large organizations', 'Most flexible']
    },
    {
      title: '172.16.0.0/12',
      description: '1 million addresses',
      items: ['172.16.0.0 - 172.31.255.255', 'Medium networks', 'Some cloud providers']
    },
    {
      title: '192.168.0.0/16',
      description: '65,536 addresses',
      items: ['192.168.0.0 - 192.168.255.255', 'Home networks', 'Common in routers']
    }
  ]}
/>

### 9.14.2. How NAT Works

**The What**: Network Address Translation (NAT) lets private networks share a public IP address.

**The Where**: Happens in the router between private network and internet.

**The Why**: Allows many private machines to access the internet through one public IP.

<ProcessFlow
  title="NAT Translation Process"
  steps={[
    {
      name: 'Internal Request',
      description: 'Host 10.23.2.4:5000 → example.com:80',
      color: colors.blue
    },
    {
      name: 'Router Intercepts',
      description: 'Records internal host and port',
      color: colors.green
    },
    {
      name: 'Router Translates',
      description: 'Changes to router_ip:40000 → example.com:80',
      color: colors.orange
    },
    {
      name: 'Reply Translation',
      description: 'Router sends reply back to 10.23.2.4:5000',
      color: colors.purple
    }
  ]}
/>

The internet only sees the router's public IP. Internal hosts are invisible.

:::warning[NAT Limitations]
NAT works for outbound connections but complicates inbound connections. Running a server behind NAT requires port forwarding configuration.
:::

## 9.15. Firewalls with iptables

### 9.15.1. Understanding Firewalls

**The What**: Firewalls filter packets based on rules.

**The Where**: iptables operates in the kernel's networking stack.

**The Why**: Protect your machine by blocking unwanted traffic.

```bash
# View firewall rules
# iptables -L

Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
```

### 9.15.2. Basic Firewall Rules

<CardGrid
  title="Firewall Chains"
  cards={[
    {
      title: 'INPUT',
      description: 'Incoming packets to this host',
      items: ['Packets destined for this machine', 'Protects local services', 'Most important for servers']
    },
    {
      title: 'OUTPUT',
      description: 'Outgoing packets from this host',
      items: ['Packets from local programs', 'Usually less restrictive', 'Prevents data exfiltration']
    },
    {
      title: 'FORWARD',
      description: 'Packets being routed through',
      items: ['Router/gateway only', 'Protects other hosts', 'Requires IP forwarding']
    }
  ]}
/>

Example firewall setup:

```bash
# Set default policy to DROP (deny all)
# iptables -P INPUT DROP

# Allow localhost
# iptables -A INPUT -s 127.0.0.1 -j ACCEPT

# Allow established connections
# iptables -A INPUT -p tcp ! --syn -j ACCEPT

# Allow SSH
# iptables -A INPUT -p tcp --destination-port 22 -j ACCEPT

# Allow ICMP (ping)
# iptables -A INPUT -p icmp -j ACCEPT
```

:::danger[Firewall Safety]
When configuring firewalls remotely via SSH:
1. Test rules carefully
2. Have physical access available
3. Use a script with rollback timer
4. Never lock yourself out!
:::

## 9.16. Wireless Networks

### 9.16.1. Understanding Wireless Components

**The What**: Wireless adds extra configuration beyond wired Ethernet.

**The Where**: Physical layer extends to include radio frequencies and encryption.

**The Why**: Wireless is inherently more complex - shared medium, security concerns, multiple networks in range.

<CardGrid
  title="Wireless Configuration Layers"
  cards={[
    {
      title: 'Physical Layer',
      description: 'Radio transmission',
      items: ['Frequency (2.4GHz, 5GHz)', 'Signal strength', 'Channel selection']
    },
    {
      title: 'Network Selection',
      description: 'Choosing a network',
      items: ['SSID (network name)', 'BSSID (access point MAC)', 'Scanning for networks']
    },
    {
      title: 'Authentication',
      description: 'Proving identity',
      items: ['Open (no auth)', 'WPA2/WPA3 passwords', 'Enterprise (802.1X)']
    },
    {
      title: 'Encryption',
      description: 'Protecting data',
      items: ['WEP (broken, never use)', 'WPA2 (AES)', 'WPA3 (latest)']
    }
  ]}
/>

### 9.16.2. Wireless Tools

```bash
# Scan for networks
# iw dev wlp1s0 scan

# Check current connection
# iw dev wlp1s0 link

# Connect to open network
# iw dev wlp1s0 connect "Network Name"
```

For secured networks, wpa_supplicant handles authentication:

```bash
# NetworkManager handles this automatically
$ nmcli device wifi list
$ nmcli device wifi connect "NetworkName" password "password"
```

:::tip[Use NetworkManager for Wireless]
While you can configure wireless manually with iw and wpa_supplicant, NetworkManager makes it much easier. It handles scanning, authentication, DHCP, and DNS automatically.
:::

## 9.17. ARP: Connecting IP to Ethernet

### 9.17.1. The ARP Problem

**The What**: Ethernet uses MAC addresses, but applications use IP addresses. How do they connect?

**The Where**: Address Resolution Protocol (ARP) maps IP addresses to MAC addresses.

**The Why**: The kernel needs both to send a packet - IP for routing decisions, MAC for physical transmission.

```bash
# View ARP cache
$ ip -4 neigh
10.1.2.1 dev enp0s31f6 lladdr 24:05:88:00:ca:a5 REACHABLE
10.1.2.57 dev enp0s31f6 lladdr 1c:f2:9a:1e:88:fb REACHABLE
```

### 9.17.2. How ARP Works

<ProcessFlow
  title="ARP Discovery Process"
  steps={[
    {
      name: 'Need MAC Address',
      description: 'Kernel needs to send to 10.23.2.5',
      color: colors.blue
    },
    {
      name: 'Broadcast ARP Request',
      description: 'Who has 10.23.2.5? Tell 10.23.2.4',
      color: colors.green
    },
    {
      name: 'Target Replies',
      description: '10.23.2.5 is at aa:bb:cc:dd:ee:ff',
      color: colors.orange
    },
    {
      name: 'Cache Entry',
      description: 'Kernel stores mapping for future use',
      color: colors.purple
    }
  ]}
/>

:::info[ARP Scope]
ARP only works on the local subnet. For destinations outside your subnet, you use ARP to find your router's MAC address, then the router handles the rest.
:::

## 9.18. IPv6 Stateless Configuration

### 9.18.1. How IPv6 Autoconfiguration Works

**The What**: IPv6 hosts can configure themselves without a DHCP server.

**The Where**: Uses Router Advertisement (RA) messages on the link-local network.

**The Why**: Simplifies configuration and removes dependency on central servers.

<ProcessFlow
  title="IPv6 Autoconfiguration"
  steps={[
    {
      name: 'Link-Local Address',
      description: 'Generate fe80:: address from MAC',
      color: colors.blue
    },
    {
      name: 'Duplicate Detection',
      description: 'Verify address is unique on network',
      color: colors.green
    },
    {
      name: 'Listen for RA',
      description: 'Router advertises global prefix',
      color: colors.orange
    },
    {
      name: 'Global Address',
      description: 'Combine prefix + interface ID',
      color: colors.purple
    }
  ]}
/>

The router's RA message contains:
- Global network prefix (e.g., 2001:db8:8500:e::/64)
- Router's link-local address (default gateway)
- DNS servers (optional)

:::tip[IPv6 Advantages]
IPv6's large address space makes stateless configuration practical. No server needed, no lease management, no address conflicts. It "just works."
:::

## 9.19. Configuring a Linux Router

### 9.19.1. Basic Router Setup

**The What**: A router is just a computer with multiple network interfaces.

**The Where**: One interface per network, plus IP forwarding enabled.

**The Why**: Connect multiple networks and route traffic between them.

```bash
# Enable IP forwarding (make it a router)
# sysctl -w net.ipv4.ip_forward=1

# Make permanent
# echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
```

Example router with two LANs:

```
Interface enp0s1: 10.23.2.1/24    (LAN A)
Interface enp0s2: 192.168.45.1/24 (LAN B)
Interface enp0s3: <public IP>     (Internet)
```

### 9.19.2. Router with NAT

For internet sharing, enable NAT:

```bash
# Enable forwarding
# sysctl -w net.ipv4.ip_forward=1

# Set default policy
# iptables -P FORWARD DROP

# Enable NAT for outgoing traffic on enp0s3
# iptables -t nat -A POSTROUTING -o enp0s3 -j MASQUERADE

# Allow established connections back in
# iptables -A FORWARD -i enp0s3 -o enp0s1 -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow LAN to internet
# iptables -A FORWARD -i enp0s1 -o enp0s3 -j ACCEPT
```

:::warning[Production Routers]
While Linux makes an excellent router, specialized hardware is often better for home/small office:
- Lower power consumption
- Simpler management
- Built-in WiFi
- Commercial support

Save Linux routers for complex scenarios or learning.
:::

## 9.20. Summary

You've learned the complete Linux networking stack:

1. **Physical Layer**: Ethernet, MAC addresses, wireless
2. **Network Layer**: IP addresses, subnets, routing
3. **Transport Layer**: TCP ports, UDP, connections
4. **Application Layer**: DNS, HTTP (next chapter)

Key concepts to remember:

- **Layers are independent**: Change one without affecting others
- **Routing by longest match**: Most specific route wins
- **NAT enables private networks**: Share one public IP
- **NetworkManager handles complexity**: Automatic configuration
- **IPv6 simplifies configuration**: Stateless autoconfiguration

<CardGrid
  title="Essential Commands Reference"
  cards={[
    {
      title: 'Viewing Configuration',
      description: 'See current network state',
      items: ['ip address show', 'ip route show', 'ip -6 address show']
    },
    {
      title: 'Testing Connectivity',
      description: 'Verify network works',
      items: ['ping <host>', 'host <name>', 'traceroute <host>']
    },
    {
      title: 'Checking Services',
      description: 'See what is listening',
      items: ['netstat -ntl', 'netstat -nt', 'lsof -i']
    },
    {
      title: 'DNS and Resolution',
      description: 'Name lookup tools',
      items: ['resolvectl status', 'host <name>', 'dig <name>']
    }
  ]}
/>

The network layer provides the foundation. In the next chapter, you'll see the application layer where network services like SSH, HTTP, and email actually use these lower layers to get work done.
