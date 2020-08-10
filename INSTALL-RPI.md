## Install the ProofMe Kiosk

# dependencies
- A Raspberry Pi 2, 3, 4 or CM3
- A microSD card
- An Ubuntu Core image
- A monitor with an HDMI interface
- An HDMI cable
- A USB keyboard

# Ubuntu SSO account
An Ubuntu SSO account is required to create the first user on an Ubuntu Core installation.

Start by creating an Ubuntu SSO account. [register](https://login.ubuntu.com/)   
Import an SSH Key into your Ubuntu SSO account. [instructions](https://help.ubuntu.com/community/SSH/OpenSSH/Keys)

# Download Core images
[RPI 3](http://cdimage.ubuntu.com/ubuntu-core/18/stable/current/ubuntu-core-18-arm64+raspi3.img.xz)
[RPI 4](http://cdimage.ubuntu.com/ubuntu-core/18/stable/current/ubuntu-core-18-arm64+raspi4.img.xz)

# Flash the microSD Card
Copy the Ubuntu image on a microSD card by following the [installation media instructions](https://ubuntu.com/download/iot/installation-media).

# Install Ubuntu Core
- Attach the monitor and keyboard to the board. You can alternatively use a serial cable.
- Insert the microSD card and plug the power adaptor into the board.

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
