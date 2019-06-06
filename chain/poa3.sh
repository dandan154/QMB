#!/bin/bash
#NOTE: Ensure that no other geth implementers (such as mist or eth wallet are using the default geth port)

mkdir ./poaDataDir/keystore -p          #Create keystore
cp ./accs/* ./poaDataDir/keystore -rf   #Add accounts to keystore

geth --datadir="./poaDataDir" init ./poagenesis.json
geth --datadir="./poaDataDir" --networkid=9999 --rpc --rpccorsdomain="*" --port=30305 --rpcapi="db,eth,net,web3,personal"

rm ./poaDataDir -rf
