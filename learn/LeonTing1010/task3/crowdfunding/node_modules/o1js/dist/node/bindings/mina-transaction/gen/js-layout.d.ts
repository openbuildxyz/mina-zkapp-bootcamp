export { jsLayout };
declare let jsLayout: {
    ZkappCommand: {
        type: string;
        name: string;
        docs: null;
        keys: string[];
        entries: {
            feePayer: {
                type: string;
                name: string;
                docs: null;
                keys: string[];
                entries: {
                    body: {
                        type: string;
                        name: string;
                        docs: null;
                        keys: string[];
                        entries: {
                            publicKey: {
                                type: string;
                            };
                            fee: {
                                type: string;
                            };
                            validUntil: {
                                type: string;
                                optionType: string;
                                inner: {
                                    type: string;
                                };
                            };
                            nonce: {
                                type: string;
                            };
                        };
                        docEntries: {
                            publicKey: null;
                            fee: null;
                            validUntil: null;
                            nonce: null;
                        };
                    };
                    authorization: {
                        type: string;
                    };
                };
                docEntries: {
                    body: null;
                    authorization: null;
                };
            };
            accountUpdates: {
                type: string;
                inner: {
                    type: string;
                    name: string;
                    docs: string;
                    keys: string[];
                    entries: {
                        body: {
                            type: string;
                            name: string;
                            docs: null;
                            keys: string[];
                            entries: {
                                publicKey: {
                                    type: string;
                                };
                                tokenId: {
                                    type: string;
                                };
                                update: {
                                    type: string;
                                    name: string;
                                    docs: null;
                                    keys: string[];
                                    entries: {
                                        appState: {
                                            type: string;
                                            inner: {
                                                type: string;
                                                optionType: string;
                                                inner: {
                                                    type: string;
                                                };
                                            };
                                            staticLength: number;
                                        };
                                        delegate: {
                                            type: string;
                                            optionType: string;
                                            inner: {
                                                type: string;
                                            };
                                        };
                                        verificationKey: {
                                            type: string;
                                            optionType: string;
                                            inner: {
                                                type: string;
                                                name: string;
                                                docs: null;
                                                keys: string[];
                                                entries: {
                                                    data: {
                                                        type: string;
                                                    };
                                                    hash: {
                                                        type: string;
                                                    };
                                                };
                                                docEntries: {
                                                    data: null;
                                                    hash: null;
                                                };
                                            };
                                        };
                                        permissions: {
                                            type: string;
                                            optionType: string;
                                            inner: {
                                                type: string;
                                                name: string;
                                                docs: null;
                                                keys: string[];
                                                entries: {
                                                    editState: {
                                                        type: string;
                                                    };
                                                    access: {
                                                        type: string;
                                                    };
                                                    send: {
                                                        type: string;
                                                    };
                                                    receive: {
                                                        type: string;
                                                    };
                                                    setDelegate: {
                                                        type: string;
                                                    };
                                                    setPermissions: {
                                                        type: string;
                                                    };
                                                    setVerificationKey: {
                                                        type: string;
                                                        name: string;
                                                        docs: null;
                                                        keys: string[];
                                                        entries: {
                                                            auth: {
                                                                type: string;
                                                            };
                                                            txnVersion: {
                                                                type: string;
                                                                checkedType: {
                                                                    type: string;
                                                                };
                                                                checkedTypeName: string;
                                                            };
                                                        };
                                                        docEntries: {
                                                            auth: null;
                                                            txnVersion: null;
                                                        };
                                                    };
                                                    setZkappUri: {
                                                        type: string;
                                                    };
                                                    editActionState: {
                                                        type: string;
                                                    };
                                                    setTokenSymbol: {
                                                        type: string;
                                                    };
                                                    incrementNonce: {
                                                        type: string;
                                                    };
                                                    setVotingFor: {
                                                        type: string;
                                                    };
                                                    setTiming: {
                                                        type: string;
                                                    };
                                                };
                                                docEntries: {
                                                    editState: null;
                                                    access: null;
                                                    send: null;
                                                    receive: null;
                                                    setDelegate: null;
                                                    setPermissions: null;
                                                    setVerificationKey: null;
                                                    setZkappUri: null;
                                                    editActionState: null;
                                                    setTokenSymbol: null;
                                                    incrementNonce: null;
                                                    setVotingFor: null;
                                                    setTiming: null;
                                                };
                                            };
                                        };
                                        zkappUri: {
                                            type: string;
                                            optionType: string;
                                            inner: {
                                                type: string;
                                                checkedType: {
                                                    type: string;
                                                    name: string;
                                                    docs: null;
                                                    keys: string[];
                                                    entries: {
                                                        data: {
                                                            type: string;
                                                        };
                                                        hash: {
                                                            type: string;
                                                        };
                                                    };
                                                    docEntries: {
                                                        data: null;
                                                        hash: null;
                                                    };
                                                };
                                                checkedTypeName: string;
                                            };
                                        };
                                        tokenSymbol: {
                                            type: string;
                                            optionType: string;
                                            inner: {
                                                type: string;
                                                checkedType: {
                                                    type: string;
                                                    name: string;
                                                    docs: null;
                                                    keys: string[];
                                                    entries: {
                                                        symbol: {
                                                            type: string;
                                                        };
                                                        field: {
                                                            type: string;
                                                        };
                                                    };
                                                    docEntries: {
                                                        symbol: string;
                                                        field: string;
                                                    };
                                                };
                                                checkedTypeName: string;
                                            };
                                        };
                                        timing: {
                                            type: string;
                                            optionType: string;
                                            inner: {
                                                type: string;
                                                name: string;
                                                docs: null;
                                                keys: string[];
                                                entries: {
                                                    initialMinimumBalance: {
                                                        type: string;
                                                    };
                                                    cliffTime: {
                                                        type: string;
                                                    };
                                                    cliffAmount: {
                                                        type: string;
                                                    };
                                                    vestingPeriod: {
                                                        type: string;
                                                    };
                                                    vestingIncrement: {
                                                        type: string;
                                                    };
                                                };
                                                docEntries: {
                                                    initialMinimumBalance: null;
                                                    cliffTime: null;
                                                    cliffAmount: null;
                                                    vestingPeriod: null;
                                                    vestingIncrement: null;
                                                };
                                            };
                                        };
                                        votingFor: {
                                            type: string;
                                            optionType: string;
                                            inner: {
                                                type: string;
                                                checkedType: {
                                                    type: string;
                                                };
                                                checkedTypeName: string;
                                            };
                                        };
                                    };
                                    docEntries: {
                                        appState: null;
                                        delegate: null;
                                        verificationKey: null;
                                        permissions: null;
                                        zkappUri: null;
                                        tokenSymbol: null;
                                        timing: null;
                                        votingFor: null;
                                    };
                                };
                                balanceChange: {
                                    type: string;
                                    name: string;
                                    docs: null;
                                    keys: string[];
                                    entries: {
                                        magnitude: {
                                            type: string;
                                        };
                                        sgn: {
                                            type: string;
                                        };
                                    };
                                    docEntries: {
                                        magnitude: null;
                                        sgn: null;
                                    };
                                    checkedType: {
                                        type: string;
                                    };
                                    checkedTypeName: string;
                                };
                                incrementNonce: {
                                    type: string;
                                };
                                events: {
                                    type: string;
                                    inner: {
                                        type: string;
                                        inner: {
                                            type: string;
                                        };
                                        staticLength: null;
                                    };
                                    staticLength: null;
                                    checkedType: {
                                        type: string;
                                        name: string;
                                        docs: null;
                                        keys: string[];
                                        entries: {
                                            data: {
                                                type: string;
                                                inner: {
                                                    type: string;
                                                    inner: {
                                                        type: string;
                                                    };
                                                    staticLength: null;
                                                };
                                                staticLength: null;
                                            };
                                            hash: {
                                                type: string;
                                            };
                                        };
                                        docEntries: {
                                            data: null;
                                            hash: null;
                                        };
                                    };
                                    checkedTypeName: string;
                                };
                                actions: {
                                    type: string;
                                    inner: {
                                        type: string;
                                        inner: {
                                            type: string;
                                        };
                                        staticLength: null;
                                    };
                                    staticLength: null;
                                    checkedType: {
                                        type: string;
                                        name: string;
                                        docs: null;
                                        keys: string[];
                                        entries: {
                                            data: {
                                                type: string;
                                                inner: {
                                                    type: string;
                                                    inner: {
                                                        type: string;
                                                    };
                                                    staticLength: null;
                                                };
                                                staticLength: null;
                                            };
                                            hash: {
                                                type: string;
                                            };
                                        };
                                        docEntries: {
                                            data: null;
                                            hash: null;
                                        };
                                    };
                                    checkedTypeName: string;
                                };
                                callData: {
                                    type: string;
                                };
                                callDepth: {
                                    type: string;
                                };
                                preconditions: {
                                    type: string;
                                    name: string;
                                    docs: null;
                                    keys: string[];
                                    entries: {
                                        network: {
                                            type: string;
                                            name: string;
                                            docs: null;
                                            keys: string[];
                                            entries: {
                                                snarkedLedgerHash: {
                                                    type: string;
                                                    optionType: string;
                                                    inner: {
                                                        type: string;
                                                    };
                                                };
                                                blockchainLength: {
                                                    type: string;
                                                    optionType: string;
                                                    rangeMin: string;
                                                    rangeMax: string;
                                                    inner: {
                                                        type: string;
                                                        name: string;
                                                        docs: null;
                                                        keys: string[];
                                                        entries: {
                                                            lower: {
                                                                type: string;
                                                            };
                                                            upper: {
                                                                type: string;
                                                            };
                                                        };
                                                        docEntries: {
                                                            lower: null;
                                                            upper: null;
                                                        };
                                                    };
                                                };
                                                minWindowDensity: {
                                                    type: string;
                                                    optionType: string;
                                                    rangeMin: string;
                                                    rangeMax: string;
                                                    inner: {
                                                        type: string;
                                                        name: string;
                                                        docs: null;
                                                        keys: string[];
                                                        entries: {
                                                            lower: {
                                                                type: string;
                                                            };
                                                            upper: {
                                                                type: string;
                                                            };
                                                        };
                                                        docEntries: {
                                                            lower: null;
                                                            upper: null;
                                                        };
                                                    };
                                                };
                                                totalCurrency: {
                                                    type: string;
                                                    optionType: string;
                                                    rangeMin: string;
                                                    rangeMax: string;
                                                    inner: {
                                                        type: string;
                                                        name: string;
                                                        docs: null;
                                                        keys: string[];
                                                        entries: {
                                                            lower: {
                                                                type: string;
                                                            };
                                                            upper: {
                                                                type: string;
                                                            };
                                                        };
                                                        docEntries: {
                                                            lower: null;
                                                            upper: null;
                                                        };
                                                    };
                                                };
                                                globalSlotSinceGenesis: {
                                                    type: string;
                                                    optionType: string;
                                                    rangeMin: string;
                                                    rangeMax: string;
                                                    inner: {
                                                        type: string;
                                                        name: string;
                                                        docs: null;
                                                        keys: string[];
                                                        entries: {
                                                            lower: {
                                                                type: string;
                                                            };
                                                            upper: {
                                                                type: string;
                                                            };
                                                        };
                                                        docEntries: {
                                                            lower: null;
                                                            upper: null;
                                                        };
                                                    };
                                                };
                                                stakingEpochData: {
                                                    type: string;
                                                    name: string;
                                                    docs: null;
                                                    keys: string[];
                                                    entries: {
                                                        ledger: {
                                                            type: string;
                                                            name: string;
                                                            docs: null;
                                                            keys: string[];
                                                            entries: {
                                                                hash: {
                                                                    type: string;
                                                                    optionType: string;
                                                                    inner: {
                                                                        type: string;
                                                                    };
                                                                };
                                                                totalCurrency: {
                                                                    type: string;
                                                                    optionType: string;
                                                                    rangeMin: string;
                                                                    rangeMax: string;
                                                                    inner: {
                                                                        type: string;
                                                                        name: string;
                                                                        docs: null;
                                                                        keys: string[];
                                                                        entries: {
                                                                            lower: {
                                                                                type: string;
                                                                            };
                                                                            upper: {
                                                                                type: string;
                                                                            };
                                                                        };
                                                                        docEntries: {
                                                                            lower: null;
                                                                            upper: null;
                                                                        };
                                                                    };
                                                                };
                                                            };
                                                            docEntries: {
                                                                hash: null;
                                                                totalCurrency: null;
                                                            };
                                                        };
                                                        seed: {
                                                            type: string;
                                                            optionType: string;
                                                            inner: {
                                                                type: string;
                                                            };
                                                        };
                                                        startCheckpoint: {
                                                            type: string;
                                                            optionType: string;
                                                            inner: {
                                                                type: string;
                                                            };
                                                        };
                                                        lockCheckpoint: {
                                                            type: string;
                                                            optionType: string;
                                                            inner: {
                                                                type: string;
                                                            };
                                                        };
                                                        epochLength: {
                                                            type: string;
                                                            optionType: string;
                                                            rangeMin: string;
                                                            rangeMax: string;
                                                            inner: {
                                                                type: string;
                                                                name: string;
                                                                docs: null;
                                                                keys: string[];
                                                                entries: {
                                                                    lower: {
                                                                        type: string;
                                                                    };
                                                                    upper: {
                                                                        type: string;
                                                                    };
                                                                };
                                                                docEntries: {
                                                                    lower: null;
                                                                    upper: null;
                                                                };
                                                            };
                                                        };
                                                    };
                                                    docEntries: {
                                                        ledger: null;
                                                        seed: null;
                                                        startCheckpoint: null;
                                                        lockCheckpoint: null;
                                                        epochLength: null;
                                                    };
                                                };
                                                nextEpochData: {
                                                    type: string;
                                                    name: string;
                                                    docs: null;
                                                    keys: string[];
                                                    entries: {
                                                        ledger: {
                                                            type: string;
                                                            name: string;
                                                            docs: null;
                                                            keys: string[];
                                                            entries: {
                                                                hash: {
                                                                    type: string;
                                                                    optionType: string;
                                                                    inner: {
                                                                        type: string;
                                                                    };
                                                                };
                                                                totalCurrency: {
                                                                    type: string;
                                                                    optionType: string;
                                                                    rangeMin: string;
                                                                    rangeMax: string;
                                                                    inner: {
                                                                        type: string;
                                                                        name: string;
                                                                        docs: null;
                                                                        keys: string[];
                                                                        entries: {
                                                                            lower: {
                                                                                type: string;
                                                                            };
                                                                            upper: {
                                                                                type: string;
                                                                            };
                                                                        };
                                                                        docEntries: {
                                                                            lower: null;
                                                                            upper: null;
                                                                        };
                                                                    };
                                                                };
                                                            };
                                                            docEntries: {
                                                                hash: null;
                                                                totalCurrency: null;
                                                            };
                                                        };
                                                        seed: {
                                                            type: string;
                                                            optionType: string;
                                                            inner: {
                                                                type: string;
                                                            };
                                                        };
                                                        startCheckpoint: {
                                                            type: string;
                                                            optionType: string;
                                                            inner: {
                                                                type: string;
                                                            };
                                                        };
                                                        lockCheckpoint: {
                                                            type: string;
                                                            optionType: string;
                                                            inner: {
                                                                type: string;
                                                            };
                                                        };
                                                        epochLength: {
                                                            type: string;
                                                            optionType: string;
                                                            rangeMin: string;
                                                            rangeMax: string;
                                                            inner: {
                                                                type: string;
                                                                name: string;
                                                                docs: null;
                                                                keys: string[];
                                                                entries: {
                                                                    lower: {
                                                                        type: string;
                                                                    };
                                                                    upper: {
                                                                        type: string;
                                                                    };
                                                                };
                                                                docEntries: {
                                                                    lower: null;
                                                                    upper: null;
                                                                };
                                                            };
                                                        };
                                                    };
                                                    docEntries: {
                                                        ledger: null;
                                                        seed: null;
                                                        startCheckpoint: null;
                                                        lockCheckpoint: null;
                                                        epochLength: null;
                                                    };
                                                };
                                            };
                                            docEntries: {
                                                snarkedLedgerHash: null;
                                                blockchainLength: null;
                                                minWindowDensity: null;
                                                totalCurrency: null;
                                                globalSlotSinceGenesis: null;
                                                stakingEpochData: null;
                                                nextEpochData: null;
                                            };
                                        };
                                        account: {
                                            type: string;
                                            name: string;
                                            docs: null;
                                            keys: string[];
                                            entries: {
                                                balance: {
                                                    type: string;
                                                    optionType: string;
                                                    rangeMin: string;
                                                    rangeMax: string;
                                                    inner: {
                                                        type: string;
                                                        name: string;
                                                        docs: null;
                                                        keys: string[];
                                                        entries: {
                                                            lower: {
                                                                type: string;
                                                            };
                                                            upper: {
                                                                type: string;
                                                            };
                                                        };
                                                        docEntries: {
                                                            lower: null;
                                                            upper: null;
                                                        };
                                                    };
                                                };
                                                nonce: {
                                                    type: string;
                                                    optionType: string;
                                                    rangeMin: string;
                                                    rangeMax: string;
                                                    inner: {
                                                        type: string;
                                                        name: string;
                                                        docs: null;
                                                        keys: string[];
                                                        entries: {
                                                            lower: {
                                                                type: string;
                                                            };
                                                            upper: {
                                                                type: string;
                                                            };
                                                        };
                                                        docEntries: {
                                                            lower: null;
                                                            upper: null;
                                                        };
                                                    };
                                                };
                                                receiptChainHash: {
                                                    type: string;
                                                    optionType: string;
                                                    inner: {
                                                        type: string;
                                                    };
                                                };
                                                delegate: {
                                                    type: string;
                                                    optionType: string;
                                                    inner: {
                                                        type: string;
                                                    };
                                                };
                                                state: {
                                                    type: string;
                                                    inner: {
                                                        type: string;
                                                        optionType: string;
                                                        inner: {
                                                            type: string;
                                                        };
                                                    };
                                                    staticLength: number;
                                                };
                                                actionState: {
                                                    type: string;
                                                    optionType: string;
                                                    inner: {
                                                        type: string;
                                                        checkedType: {
                                                            type: string;
                                                        };
                                                        checkedTypeName: string;
                                                    };
                                                };
                                                provedState: {
                                                    type: string;
                                                    optionType: string;
                                                    inner: {
                                                        type: string;
                                                    };
                                                };
                                                isNew: {
                                                    type: string;
                                                    optionType: string;
                                                    inner: {
                                                        type: string;
                                                    };
                                                };
                                            };
                                            docEntries: {
                                                balance: null;
                                                nonce: null;
                                                receiptChainHash: null;
                                                delegate: null;
                                                state: null;
                                                actionState: null;
                                                provedState: null;
                                                isNew: null;
                                            };
                                        };
                                        validWhile: {
                                            type: string;
                                            optionType: string;
                                            rangeMin: string;
                                            rangeMax: string;
                                            inner: {
                                                type: string;
                                                name: string;
                                                docs: null;
                                                keys: string[];
                                                entries: {
                                                    lower: {
                                                        type: string;
                                                    };
                                                    upper: {
                                                        type: string;
                                                    };
                                                };
                                                docEntries: {
                                                    lower: null;
                                                    upper: null;
                                                };
                                            };
                                        };
                                    };
                                    docEntries: {
                                        network: null;
                                        account: null;
                                        validWhile: null;
                                    };
                                };
                                useFullCommitment: {
                                    type: string;
                                };
                                implicitAccountCreationFee: {
                                    type: string;
                                };
                                mayUseToken: {
                                    type: string;
                                    name: string;
                                    docs: null;
                                    keys: string[];
                                    entries: {
                                        parentsOwnToken: {
                                            type: string;
                                        };
                                        inheritFromParent: {
                                            type: string;
                                        };
                                    };
                                    docEntries: {
                                        parentsOwnToken: null;
                                        inheritFromParent: null;
                                    };
                                    checkedType: {
                                        type: string;
                                        name: string;
                                        docs: null;
                                        keys: string[];
                                        entries: {
                                            parentsOwnToken: {
                                                type: string;
                                            };
                                            inheritFromParent: {
                                                type: string;
                                            };
                                        };
                                        docEntries: {
                                            parentsOwnToken: string;
                                            inheritFromParent: string;
                                        };
                                    };
                                    checkedTypeName: string;
                                };
                                authorizationKind: {
                                    type: string;
                                    name: string;
                                    docs: null;
                                    keys: string[];
                                    entries: {
                                        isSigned: {
                                            type: string;
                                        };
                                        isProved: {
                                            type: string;
                                        };
                                        verificationKeyHash: {
                                            type: string;
                                            checkedType: {
                                                type: string;
                                            };
                                            checkedTypeName: string;
                                        };
                                    };
                                    docEntries: {
                                        isSigned: null;
                                        isProved: null;
                                        verificationKeyHash: null;
                                    };
                                };
                            };
                            docEntries: {
                                publicKey: null;
                                tokenId: null;
                                update: null;
                                balanceChange: null;
                                incrementNonce: null;
                                events: null;
                                actions: null;
                                callData: null;
                                callDepth: null;
                                preconditions: null;
                                useFullCommitment: null;
                                implicitAccountCreationFee: null;
                                mayUseToken: null;
                                authorizationKind: null;
                            };
                        };
                        authorization: {
                            type: string;
                            name: string;
                            docs: null;
                            keys: string[];
                            entries: {
                                proof: {
                                    type: string;
                                    optionType: string;
                                    inner: {
                                        type: string;
                                    };
                                };
                                signature: {
                                    type: string;
                                    optionType: string;
                                    inner: {
                                        type: string;
                                    };
                                };
                            };
                            docEntries: {
                                proof: null;
                                signature: null;
                            };
                        };
                    };
                    docEntries: {
                        body: null;
                        authorization: null;
                    };
                };
                staticLength: null;
            };
            memo: {
                type: string;
            };
        };
        docEntries: {
            feePayer: null;
            accountUpdates: null;
            memo: null;
        };
    };
    AccountUpdate: {
        type: string;
        name: string;
        docs: string;
        keys: string[];
        entries: {
            body: {
                type: string;
                name: string;
                docs: null;
                keys: string[];
                entries: {
                    publicKey: {
                        type: string;
                    };
                    tokenId: {
                        type: string;
                    };
                    update: {
                        type: string;
                        name: string;
                        docs: null;
                        keys: string[];
                        entries: {
                            appState: {
                                type: string;
                                inner: {
                                    type: string;
                                    optionType: string;
                                    inner: {
                                        type: string;
                                    };
                                };
                                staticLength: number;
                            };
                            delegate: {
                                type: string;
                                optionType: string;
                                inner: {
                                    type: string;
                                };
                            };
                            verificationKey: {
                                type: string;
                                optionType: string;
                                inner: {
                                    type: string;
                                    name: string;
                                    docs: null;
                                    keys: string[];
                                    entries: {
                                        data: {
                                            type: string;
                                        };
                                        hash: {
                                            type: string;
                                        };
                                    };
                                    docEntries: {
                                        data: null;
                                        hash: null;
                                    };
                                };
                            };
                            permissions: {
                                type: string;
                                optionType: string;
                                inner: {
                                    type: string;
                                    name: string;
                                    docs: null;
                                    keys: string[];
                                    entries: {
                                        editState: {
                                            type: string;
                                        };
                                        access: {
                                            type: string;
                                        };
                                        send: {
                                            type: string;
                                        };
                                        receive: {
                                            type: string;
                                        };
                                        setDelegate: {
                                            type: string;
                                        };
                                        setPermissions: {
                                            type: string;
                                        };
                                        setVerificationKey: {
                                            type: string;
                                            name: string;
                                            docs: null;
                                            keys: string[];
                                            entries: {
                                                auth: {
                                                    type: string;
                                                };
                                                txnVersion: {
                                                    type: string;
                                                    checkedType: {
                                                        type: string;
                                                    };
                                                    checkedTypeName: string;
                                                };
                                            };
                                            docEntries: {
                                                auth: null;
                                                txnVersion: null;
                                            };
                                        };
                                        setZkappUri: {
                                            type: string;
                                        };
                                        editActionState: {
                                            type: string;
                                        };
                                        setTokenSymbol: {
                                            type: string;
                                        };
                                        incrementNonce: {
                                            type: string;
                                        };
                                        setVotingFor: {
                                            type: string;
                                        };
                                        setTiming: {
                                            type: string;
                                        };
                                    };
                                    docEntries: {
                                        editState: null;
                                        access: null;
                                        send: null;
                                        receive: null;
                                        setDelegate: null;
                                        setPermissions: null;
                                        setVerificationKey: null;
                                        setZkappUri: null;
                                        editActionState: null;
                                        setTokenSymbol: null;
                                        incrementNonce: null;
                                        setVotingFor: null;
                                        setTiming: null;
                                    };
                                };
                            };
                            zkappUri: {
                                type: string;
                                optionType: string;
                                inner: {
                                    type: string;
                                    checkedType: {
                                        type: string;
                                        name: string;
                                        docs: null;
                                        keys: string[];
                                        entries: {
                                            data: {
                                                type: string;
                                            };
                                            hash: {
                                                type: string;
                                            };
                                        };
                                        docEntries: {
                                            data: null;
                                            hash: null;
                                        };
                                    };
                                    checkedTypeName: string;
                                };
                            };
                            tokenSymbol: {
                                type: string;
                                optionType: string;
                                inner: {
                                    type: string;
                                    checkedType: {
                                        type: string;
                                        name: string;
                                        docs: null;
                                        keys: string[];
                                        entries: {
                                            symbol: {
                                                type: string;
                                            };
                                            field: {
                                                type: string;
                                            };
                                        };
                                        docEntries: {
                                            symbol: string;
                                            field: string;
                                        };
                                    };
                                    checkedTypeName: string;
                                };
                            };
                            timing: {
                                type: string;
                                optionType: string;
                                inner: {
                                    type: string;
                                    name: string;
                                    docs: null;
                                    keys: string[];
                                    entries: {
                                        initialMinimumBalance: {
                                            type: string;
                                        };
                                        cliffTime: {
                                            type: string;
                                        };
                                        cliffAmount: {
                                            type: string;
                                        };
                                        vestingPeriod: {
                                            type: string;
                                        };
                                        vestingIncrement: {
                                            type: string;
                                        };
                                    };
                                    docEntries: {
                                        initialMinimumBalance: null;
                                        cliffTime: null;
                                        cliffAmount: null;
                                        vestingPeriod: null;
                                        vestingIncrement: null;
                                    };
                                };
                            };
                            votingFor: {
                                type: string;
                                optionType: string;
                                inner: {
                                    type: string;
                                    checkedType: {
                                        type: string;
                                    };
                                    checkedTypeName: string;
                                };
                            };
                        };
                        docEntries: {
                            appState: null;
                            delegate: null;
                            verificationKey: null;
                            permissions: null;
                            zkappUri: null;
                            tokenSymbol: null;
                            timing: null;
                            votingFor: null;
                        };
                    };
                    balanceChange: {
                        type: string;
                        name: string;
                        docs: null;
                        keys: string[];
                        entries: {
                            magnitude: {
                                type: string;
                            };
                            sgn: {
                                type: string;
                            };
                        };
                        docEntries: {
                            magnitude: null;
                            sgn: null;
                        };
                        checkedType: {
                            type: string;
                        };
                        checkedTypeName: string;
                    };
                    incrementNonce: {
                        type: string;
                    };
                    events: {
                        type: string;
                        inner: {
                            type: string;
                            inner: {
                                type: string;
                            };
                            staticLength: null;
                        };
                        staticLength: null;
                        checkedType: {
                            type: string;
                            name: string;
                            docs: null;
                            keys: string[];
                            entries: {
                                data: {
                                    type: string;
                                    inner: {
                                        type: string;
                                        inner: {
                                            type: string;
                                        };
                                        staticLength: null;
                                    };
                                    staticLength: null;
                                };
                                hash: {
                                    type: string;
                                };
                            };
                            docEntries: {
                                data: null;
                                hash: null;
                            };
                        };
                        checkedTypeName: string;
                    };
                    actions: {
                        type: string;
                        inner: {
                            type: string;
                            inner: {
                                type: string;
                            };
                            staticLength: null;
                        };
                        staticLength: null;
                        checkedType: {
                            type: string;
                            name: string;
                            docs: null;
                            keys: string[];
                            entries: {
                                data: {
                                    type: string;
                                    inner: {
                                        type: string;
                                        inner: {
                                            type: string;
                                        };
                                        staticLength: null;
                                    };
                                    staticLength: null;
                                };
                                hash: {
                                    type: string;
                                };
                            };
                            docEntries: {
                                data: null;
                                hash: null;
                            };
                        };
                        checkedTypeName: string;
                    };
                    callData: {
                        type: string;
                    };
                    callDepth: {
                        type: string;
                    };
                    preconditions: {
                        type: string;
                        name: string;
                        docs: null;
                        keys: string[];
                        entries: {
                            network: {
                                type: string;
                                name: string;
                                docs: null;
                                keys: string[];
                                entries: {
                                    snarkedLedgerHash: {
                                        type: string;
                                        optionType: string;
                                        inner: {
                                            type: string;
                                        };
                                    };
                                    blockchainLength: {
                                        type: string;
                                        optionType: string;
                                        rangeMin: string;
                                        rangeMax: string;
                                        inner: {
                                            type: string;
                                            name: string;
                                            docs: null;
                                            keys: string[];
                                            entries: {
                                                lower: {
                                                    type: string;
                                                };
                                                upper: {
                                                    type: string;
                                                };
                                            };
                                            docEntries: {
                                                lower: null;
                                                upper: null;
                                            };
                                        };
                                    };
                                    minWindowDensity: {
                                        type: string;
                                        optionType: string;
                                        rangeMin: string;
                                        rangeMax: string;
                                        inner: {
                                            type: string;
                                            name: string;
                                            docs: null;
                                            keys: string[];
                                            entries: {
                                                lower: {
                                                    type: string;
                                                };
                                                upper: {
                                                    type: string;
                                                };
                                            };
                                            docEntries: {
                                                lower: null;
                                                upper: null;
                                            };
                                        };
                                    };
                                    totalCurrency: {
                                        type: string;
                                        optionType: string;
                                        rangeMin: string;
                                        rangeMax: string;
                                        inner: {
                                            type: string;
                                            name: string;
                                            docs: null;
                                            keys: string[];
                                            entries: {
                                                lower: {
                                                    type: string;
                                                };
                                                upper: {
                                                    type: string;
                                                };
                                            };
                                            docEntries: {
                                                lower: null;
                                                upper: null;
                                            };
                                        };
                                    };
                                    globalSlotSinceGenesis: {
                                        type: string;
                                        optionType: string;
                                        rangeMin: string;
                                        rangeMax: string;
                                        inner: {
                                            type: string;
                                            name: string;
                                            docs: null;
                                            keys: string[];
                                            entries: {
                                                lower: {
                                                    type: string;
                                                };
                                                upper: {
                                                    type: string;
                                                };
                                            };
                                            docEntries: {
                                                lower: null;
                                                upper: null;
                                            };
                                        };
                                    };
                                    stakingEpochData: {
                                        type: string;
                                        name: string;
                                        docs: null;
                                        keys: string[];
                                        entries: {
                                            ledger: {
                                                type: string;
                                                name: string;
                                                docs: null;
                                                keys: string[];
                                                entries: {
                                                    hash: {
                                                        type: string;
                                                        optionType: string;
                                                        inner: {
                                                            type: string;
                                                        };
                                                    };
                                                    totalCurrency: {
                                                        type: string;
                                                        optionType: string;
                                                        rangeMin: string;
                                                        rangeMax: string;
                                                        inner: {
                                                            type: string;
                                                            name: string;
                                                            docs: null;
                                                            keys: string[];
                                                            entries: {
                                                                lower: {
                                                                    type: string;
                                                                };
                                                                upper: {
                                                                    type: string;
                                                                };
                                                            };
                                                            docEntries: {
                                                                lower: null;
                                                                upper: null;
                                                            };
                                                        };
                                                    };
                                                };
                                                docEntries: {
                                                    hash: null;
                                                    totalCurrency: null;
                                                };
                                            };
                                            seed: {
                                                type: string;
                                                optionType: string;
                                                inner: {
                                                    type: string;
                                                };
                                            };
                                            startCheckpoint: {
                                                type: string;
                                                optionType: string;
                                                inner: {
                                                    type: string;
                                                };
                                            };
                                            lockCheckpoint: {
                                                type: string;
                                                optionType: string;
                                                inner: {
                                                    type: string;
                                                };
                                            };
                                            epochLength: {
                                                type: string;
                                                optionType: string;
                                                rangeMin: string;
                                                rangeMax: string;
                                                inner: {
                                                    type: string;
                                                    name: string;
                                                    docs: null;
                                                    keys: string[];
                                                    entries: {
                                                        lower: {
                                                            type: string;
                                                        };
                                                        upper: {
                                                            type: string;
                                                        };
                                                    };
                                                    docEntries: {
                                                        lower: null;
                                                        upper: null;
                                                    };
                                                };
                                            };
                                        };
                                        docEntries: {
                                            ledger: null;
                                            seed: null;
                                            startCheckpoint: null;
                                            lockCheckpoint: null;
                                            epochLength: null;
                                        };
                                    };
                                    nextEpochData: {
                                        type: string;
                                        name: string;
                                        docs: null;
                                        keys: string[];
                                        entries: {
                                            ledger: {
                                                type: string;
                                                name: string;
                                                docs: null;
                                                keys: string[];
                                                entries: {
                                                    hash: {
                                                        type: string;
                                                        optionType: string;
                                                        inner: {
                                                            type: string;
                                                        };
                                                    };
                                                    totalCurrency: {
                                                        type: string;
                                                        optionType: string;
                                                        rangeMin: string;
                                                        rangeMax: string;
                                                        inner: {
                                                            type: string;
                                                            name: string;
                                                            docs: null;
                                                            keys: string[];
                                                            entries: {
                                                                lower: {
                                                                    type: string;
                                                                };
                                                                upper: {
                                                                    type: string;
                                                                };
                                                            };
                                                            docEntries: {
                                                                lower: null;
                                                                upper: null;
                                                            };
                                                        };
                                                    };
                                                };
                                                docEntries: {
                                                    hash: null;
                                                    totalCurrency: null;
                                                };
                                            };
                                            seed: {
                                                type: string;
                                                optionType: string;
                                                inner: {
                                                    type: string;
                                                };
                                            };
                                            startCheckpoint: {
                                                type: string;
                                                optionType: string;
                                                inner: {
                                                    type: string;
                                                };
                                            };
                                            lockCheckpoint: {
                                                type: string;
                                                optionType: string;
                                                inner: {
                                                    type: string;
                                                };
                                            };
                                            epochLength: {
                                                type: string;
                                                optionType: string;
                                                rangeMin: string;
                                                rangeMax: string;
                                                inner: {
                                                    type: string;
                                                    name: string;
                                                    docs: null;
                                                    keys: string[];
                                                    entries: {
                                                        lower: {
                                                            type: string;
                                                        };
                                                        upper: {
                                                            type: string;
                                                        };
                                                    };
                                                    docEntries: {
                                                        lower: null;
                                                        upper: null;
                                                    };
                                                };
                                            };
                                        };
                                        docEntries: {
                                            ledger: null;
                                            seed: null;
                                            startCheckpoint: null;
                                            lockCheckpoint: null;
                                            epochLength: null;
                                        };
                                    };
                                };
                                docEntries: {
                                    snarkedLedgerHash: null;
                                    blockchainLength: null;
                                    minWindowDensity: null;
                                    totalCurrency: null;
                                    globalSlotSinceGenesis: null;
                                    stakingEpochData: null;
                                    nextEpochData: null;
                                };
                            };
                            account: {
                                type: string;
                                name: string;
                                docs: null;
                                keys: string[];
                                entries: {
                                    balance: {
                                        type: string;
                                        optionType: string;
                                        rangeMin: string;
                                        rangeMax: string;
                                        inner: {
                                            type: string;
                                            name: string;
                                            docs: null;
                                            keys: string[];
                                            entries: {
                                                lower: {
                                                    type: string;
                                                };
                                                upper: {
                                                    type: string;
                                                };
                                            };
                                            docEntries: {
                                                lower: null;
                                                upper: null;
                                            };
                                        };
                                    };
                                    nonce: {
                                        type: string;
                                        optionType: string;
                                        rangeMin: string;
                                        rangeMax: string;
                                        inner: {
                                            type: string;
                                            name: string;
                                            docs: null;
                                            keys: string[];
                                            entries: {
                                                lower: {
                                                    type: string;
                                                };
                                                upper: {
                                                    type: string;
                                                };
                                            };
                                            docEntries: {
                                                lower: null;
                                                upper: null;
                                            };
                                        };
                                    };
                                    receiptChainHash: {
                                        type: string;
                                        optionType: string;
                                        inner: {
                                            type: string;
                                        };
                                    };
                                    delegate: {
                                        type: string;
                                        optionType: string;
                                        inner: {
                                            type: string;
                                        };
                                    };
                                    state: {
                                        type: string;
                                        inner: {
                                            type: string;
                                            optionType: string;
                                            inner: {
                                                type: string;
                                            };
                                        };
                                        staticLength: number;
                                    };
                                    actionState: {
                                        type: string;
                                        optionType: string;
                                        inner: {
                                            type: string;
                                            checkedType: {
                                                type: string;
                                            };
                                            checkedTypeName: string;
                                        };
                                    };
                                    provedState: {
                                        type: string;
                                        optionType: string;
                                        inner: {
                                            type: string;
                                        };
                                    };
                                    isNew: {
                                        type: string;
                                        optionType: string;
                                        inner: {
                                            type: string;
                                        };
                                    };
                                };
                                docEntries: {
                                    balance: null;
                                    nonce: null;
                                    receiptChainHash: null;
                                    delegate: null;
                                    state: null;
                                    actionState: null;
                                    provedState: null;
                                    isNew: null;
                                };
                            };
                            validWhile: {
                                type: string;
                                optionType: string;
                                rangeMin: string;
                                rangeMax: string;
                                inner: {
                                    type: string;
                                    name: string;
                                    docs: null;
                                    keys: string[];
                                    entries: {
                                        lower: {
                                            type: string;
                                        };
                                        upper: {
                                            type: string;
                                        };
                                    };
                                    docEntries: {
                                        lower: null;
                                        upper: null;
                                    };
                                };
                            };
                        };
                        docEntries: {
                            network: null;
                            account: null;
                            validWhile: null;
                        };
                    };
                    useFullCommitment: {
                        type: string;
                    };
                    implicitAccountCreationFee: {
                        type: string;
                    };
                    mayUseToken: {
                        type: string;
                        name: string;
                        docs: null;
                        keys: string[];
                        entries: {
                            parentsOwnToken: {
                                type: string;
                            };
                            inheritFromParent: {
                                type: string;
                            };
                        };
                        docEntries: {
                            parentsOwnToken: null;
                            inheritFromParent: null;
                        };
                        checkedType: {
                            type: string;
                            name: string;
                            docs: null;
                            keys: string[];
                            entries: {
                                parentsOwnToken: {
                                    type: string;
                                };
                                inheritFromParent: {
                                    type: string;
                                };
                            };
                            docEntries: {
                                parentsOwnToken: string;
                                inheritFromParent: string;
                            };
                        };
                        checkedTypeName: string;
                    };
                    authorizationKind: {
                        type: string;
                        name: string;
                        docs: null;
                        keys: string[];
                        entries: {
                            isSigned: {
                                type: string;
                            };
                            isProved: {
                                type: string;
                            };
                            verificationKeyHash: {
                                type: string;
                                checkedType: {
                                    type: string;
                                };
                                checkedTypeName: string;
                            };
                        };
                        docEntries: {
                            isSigned: null;
                            isProved: null;
                            verificationKeyHash: null;
                        };
                    };
                };
                docEntries: {
                    publicKey: null;
                    tokenId: null;
                    update: null;
                    balanceChange: null;
                    incrementNonce: null;
                    events: null;
                    actions: null;
                    callData: null;
                    callDepth: null;
                    preconditions: null;
                    useFullCommitment: null;
                    implicitAccountCreationFee: null;
                    mayUseToken: null;
                    authorizationKind: null;
                };
            };
            authorization: {
                type: string;
                name: string;
                docs: null;
                keys: string[];
                entries: {
                    proof: {
                        type: string;
                        optionType: string;
                        inner: {
                            type: string;
                        };
                    };
                    signature: {
                        type: string;
                        optionType: string;
                        inner: {
                            type: string;
                        };
                    };
                };
                docEntries: {
                    proof: null;
                    signature: null;
                };
            };
        };
        docEntries: {
            body: null;
            authorization: null;
        };
    };
    Account: {
        type: string;
        name: string;
        docs: null;
        keys: string[];
        entries: {
            publicKey: {
                type: string;
            };
            tokenId: {
                type: string;
            };
            tokenSymbol: {
                type: string;
            };
            balance: {
                type: string;
            };
            nonce: {
                type: string;
            };
            receiptChainHash: {
                type: string;
                checkedType: {
                    type: string;
                };
                checkedTypeName: string;
            };
            delegate: {
                type: string;
                optionType: string;
                inner: {
                    type: string;
                };
            };
            votingFor: {
                type: string;
            };
            timing: {
                type: string;
                name: string;
                docs: null;
                keys: string[];
                entries: {
                    isTimed: {
                        type: string;
                    };
                    initialMinimumBalance: {
                        type: string;
                    };
                    cliffTime: {
                        type: string;
                    };
                    cliffAmount: {
                        type: string;
                    };
                    vestingPeriod: {
                        type: string;
                    };
                    vestingIncrement: {
                        type: string;
                    };
                };
                docEntries: {
                    isTimed: null;
                    initialMinimumBalance: null;
                    cliffTime: null;
                    cliffAmount: null;
                    vestingPeriod: null;
                    vestingIncrement: null;
                };
            };
            permissions: {
                type: string;
                name: string;
                docs: null;
                keys: string[];
                entries: {
                    editState: {
                        type: string;
                    };
                    access: {
                        type: string;
                    };
                    send: {
                        type: string;
                    };
                    receive: {
                        type: string;
                    };
                    setDelegate: {
                        type: string;
                    };
                    setPermissions: {
                        type: string;
                    };
                    setVerificationKey: {
                        type: string;
                        name: string;
                        docs: null;
                        keys: string[];
                        entries: {
                            auth: {
                                type: string;
                            };
                            txnVersion: {
                                type: string;
                                checkedType: {
                                    type: string;
                                };
                                checkedTypeName: string;
                            };
                        };
                        docEntries: {
                            auth: null;
                            txnVersion: null;
                        };
                    };
                    setZkappUri: {
                        type: string;
                    };
                    editActionState: {
                        type: string;
                    };
                    setTokenSymbol: {
                        type: string;
                    };
                    incrementNonce: {
                        type: string;
                    };
                    setVotingFor: {
                        type: string;
                    };
                    setTiming: {
                        type: string;
                    };
                };
                docEntries: {
                    editState: null;
                    access: null;
                    send: null;
                    receive: null;
                    setDelegate: null;
                    setPermissions: null;
                    setVerificationKey: null;
                    setZkappUri: null;
                    editActionState: null;
                    setTokenSymbol: null;
                    incrementNonce: null;
                    setVotingFor: null;
                    setTiming: null;
                };
            };
            zkapp: {
                type: string;
                optionType: string;
                inner: {
                    type: string;
                    name: string;
                    docs: null;
                    keys: string[];
                    entries: {
                        appState: {
                            type: string;
                            inner: {
                                type: string;
                            };
                            staticLength: number;
                        };
                        verificationKey: {
                            type: string;
                            optionType: string;
                            inner: {
                                type: string;
                                name: string;
                                docs: null;
                                keys: string[];
                                entries: {
                                    data: {
                                        type: string;
                                    };
                                    hash: {
                                        type: string;
                                    };
                                };
                                docEntries: {
                                    data: null;
                                    hash: null;
                                };
                            };
                        };
                        zkappVersion: {
                            type: string;
                        };
                        actionState: {
                            type: string;
                            inner: {
                                type: string;
                            };
                            staticLength: number;
                        };
                        lastActionSlot: {
                            type: string;
                        };
                        provedState: {
                            type: string;
                        };
                        zkappUri: {
                            type: string;
                        };
                    };
                    docEntries: {
                        appState: null;
                        verificationKey: null;
                        zkappVersion: null;
                        actionState: null;
                        lastActionSlot: null;
                        provedState: null;
                        zkappUri: null;
                    };
                };
            };
        };
        docEntries: {
            publicKey: null;
            tokenId: null;
            tokenSymbol: null;
            balance: null;
            nonce: null;
            receiptChainHash: null;
            delegate: null;
            votingFor: null;
            timing: null;
            permissions: null;
            zkapp: null;
        };
    };
};
