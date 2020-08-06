## Building for ubuntu core arm64

This snap needs to be build on an arm64 processor or on a QEMU instance

## dependecies
- snapcraft
- internet
- qemu

## Prepare Qemu

Get Ubuntu Image and QEMU EFI:
``` bash
wget https://cloud-images.ubuntu.com/releases/18.04/release/ubuntu-18.04-server-cloudimg-arm64.img
wget https://releases.linaro.org/components/kernel/uefi-linaro/latest/release/qemu64/QEMU_EFI.fd
```

Create EFI volumes:
``` bash
dd if=/dev/zero of=flash0.img bs=1m count=64
dd if=QEMU_EFI.fd of=flash0.img conv=notrunc
dd if=/dev/zero of=flash1.img bs=1m count=64
```

Create a `cloud.txt` file replacing the username, here shown as `didux`, with password `secret` and the ssh-rsa value with the values appropriate for you:
```
users:
  - name: didux
    lock-passwd: false
    passwd: $1$SaltSalt$YhgRYajLPrYevs14poKBQ0
    ssh-authorized-keys:
      - ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    groups: sudo
    shell: /bin/bash
```

Create a cloud-config disk image:

```
cloud-localds --disk-format qcow2 cloud.img cloud.txt
```

cloud-localds is part of the cloud-utils package which is not is not available on OSX. I used an Ubuntu docker image to run the command.

```
docker run --rm -it -v $(pwd):$(pwd) -w $(pwd) ubuntu
apt-get update && apt-get -y install cloud-utils
cloud-localds --disk-format qcow2 cloud.img cloud.txt
```

Backup your image:

```
cp ubuntu-18.04-server-cloudimg-arm64.img ubuntu-18.04-server-cloudimg-arm64.img.original
```

Increase disk space with 25GB (Default is 2GB):
```
qemu-img resize ubuntu-18.04-server-cloudimg-arm64.img +25G
```

Launch QEMU Guest:
```
qemu-system-aarch64 -m 4096 -smp 4 -cpu cortex-a57 -M virt -nographic \
  -pflash flash0.img \
  -pflash flash1.img \
  -drive if=none,file=ubuntu-18.04-server-cloudimg-arm64.img,id=hd0 \
  -device virtio-blk-device,drive=hd0 \
  -drive if=none,id=cloud,file=cloud.img \
  -device virtio-blk-device,drive=cloud \
  -netdev user,id=user0,hostfwd=tcp::2222-:22 -device virtio-net-device,netdev=user0
```

login with `didux` : `secret` or ssh into the machine
``` 
ssh -p 2222 didux@localhost
```

install snapcraft
```
sudo snap install snapcraft --classic
```

install nodejs 10 (OPTIONAL)
```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt install nodejs
```

## Build a snap
Execute 'snapcraft' to build a kiosk snap.

``` bash
SNAPCRAFT_BUILD_ENVIRONMENT=host snapcraft
```
