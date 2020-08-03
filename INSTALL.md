## Install the ProofMe Kiosk

# dependencies
- An Ubuntu SSO account with an SSH key
- 2 USB 2.0 or 3.0 flash drives (2GB minimum)
- A monitor
- A USB keyboard and a mouse
- A network connection with Internet access
- An Ubuntu Desktop image
- An Ubuntu Core image

# Ubuntu SSO account
An Ubuntu SSO account is required to create the first user on an Ubuntu Core installation.

Start by creating an Ubuntu SSO account. [register](https://login.ubuntu.com/)   
Import an SSH Key into your Ubuntu SSO account. [instructions](https://help.ubuntu.com/community/SSH/OpenSSH/Keys)

# Download Core images
[Intel nuc](https://people.canonical.com/~platform/images/nuc/intel_dawson/dawson-uc18-m7-20190122-10.img.xz)

# Download Ubuntu Desktop
[Ubuntu 20.04](https://ubuntu.com/download/desktop)

# Flash the USB drives
- Download and copy the Ubuntu Desktop image on the first USB flash drive by following the live USB Ubuntu Desktop tutorial for Ubuntu, Windows, or macOS
- Copy the Ubuntu Core image on the second USB flash drive

# Install Ubuntu Core
- Connect your USB hub, keyboard, mouse, monitor to the device.
- Insert the first USB flash drive, containing Ubuntu Desktop.
- Connect the USB hub, keyboard, mouse and the monitor to the device.
- Insert the Live USB Ubuntu Desktop flash drive in the device.

# Boot from the Live USB flash drive
- Start the device and push F10 to enter the boot menu.
- Select the USB flash drive as a boot option.
- Select "Try Ubuntu without installing”.

# Flash Ubuntu Core
- Once the Ubuntu session has started, insert the second USB flash drive containing the Ubuntu Core image file.  
- Open a terminal and use the following command to find out the target disk device to install the Ubuntu Core image to:  

`sudo fdisk -l`  
- Run the following command, where `<disk label>` is the label of the second USB flash drive:

`xzcat /media/ubuntu/<disk label>/dawson-uc18-m7-20190122-10.img.xz | sudo dd of=/dev/<target disk device> bs=32M status=progress; sync`  
- Reboot the system and remove the flash drives when prompted. It will then boot from the internal memory where Ubuntu Core has been flashed.

# First boot setup
- The system will boot then become ready to configure.
- The device will display the prompt “Press enter to configure”.
- Press enter then select “Start” to begin configuring your network and an administrator account. Follow the instructions on the screen, you will be asked to configure your network and enter your Ubuntu SSO credentials.
- At the end of the process, you will see your credentials to access your Ubuntu Core machine:

```
This device is registered to <Ubuntu SSO email address>.
Remote access was enabled via authentication with the SSO user <Ubuntu SSO user name>
Public SSH keys were added to the device for remote access.
```

# Login
-  Once setup is done, you can login with SSH into Ubuntu Core, from a machine on the same network, using the following command:

`ssh <Ubuntu SSO user name>@<device IP address>`
- Your user name is your Ubuntu SSO user name, it has been reminded to you at the end of the account configuration step.

# Install ProofMe Kiosk
- run the ProofMe Kiosk Snap from the store
`snap install mir-kiosk proofme-kiosk`
- **ProofMe Kiosk is installed**
