#!/bin/bash
#NOTE: Ensure that no other geth implementers (such as mist or eth wallet are using the default geth port)


mkdir ./poaDataDir/keystore -p          #Create keystore
cp ./accs/* ./poaDataDir/keystore -rf   #Add accounts to keystore

gnome-terminal --tab --command="bash -c 'geth --datadir="./poaDataDir" init ./poagenesis.json; geth --datadir="./poaDataDir" --networkid=9999 --rpc --rpccorsdomain="*" --rpcapi="db,eth,net,web3,personal"; $SHELL'"
sleep 5s
geth attach ./poaDataDir/geth.ipc #Open Javascript API

rm ./poaDataDir -rf
