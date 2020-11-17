import fs from 'fs'
import path from 'path'
import { ethers } from "ethers"

const provider = new ethers.providers.InfuraProvider("mainnet", "yourApiKey")

import contractJSON from "./ERC20.json"
const contractAddress = "0x..."
const iface = new ethers.utils.Interface(contractJSON.abi)
const contract = new ethers.Contract(
    contractAddress,
    iface,
    provider
)

const run = async () => {
    const approvalEventFilter = contract.filters.Approval()
    const approvalEvents = await contract.queryFilter(approvalEventFilter)
    const approvalEventsArgs: any[] = approvalEvents.map((event: any) => event['args'])
    const numEvents = approvalEvents.length

    console.log(numEvents)
    const eventData = {}
    for (let i = 0; i < numEvents; i++) {
        const d = {
            owner: approvalEventsArgs[i]['owner'],
            spender: approvalEventsArgs[i]['spender'],
            value: approvalEventsArgs[i]['value'].toString()
        }
        eventData[i] = d
    }

    fs.writeFileSync(
        path.join(__dirname, './eventData'),
        JSON.stringify(
            eventData
        )
    )
}

run()
