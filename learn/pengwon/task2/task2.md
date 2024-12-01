# Task2

## 安装zkapp-cli

```bash
npm install -g zkapp-cli
```

验证安装：

```bash
zk -v
# 0.22.1

zk -h

# Usage: zk <command> [options]

# Commands:
#   zk project [name]                    Create a new project   [aliases: proj, p]
#   zk file [name]                       Create a file and generate the
#                                        corresponding test file      [aliases: f]
#   zk config [list] [lightnet]          List or add a new deploy alias
#   zk deploy [alias]                    Deploy or redeploy a zkApp
#   zk example [name]                    Create an example project    [aliases: e]
#   zk system                            Show system info        [aliases: sys, s]
#   zk lightnet <sub-command> [options]  Manage the lightweight Mina blockchain
#                                        network for zkApps development and
#                                        testing purposes.
#                                        More information can be found at:
#                                        https://docs.minaprotocol.com/zkapps/test
#                                        ing-zkapps-lightnet

# Options:
#   -h, --help     Show help                                             [boolean]
#   -v, --version  Show version number                                   [boolean]



#          __         _
#         /_ |       | |
#      ___ | |   __ _| |__  ___
#     / _ \| |  / _` | '_ \/ __|
#    | (_) | |_| (_| | |_) \__ \
#     \___/|____\__,_|_.__/|___/

#         https://o1labs.org
```

## [电路代码](./vote-counter/src/VoteCounter.ts)

## [测试代码](./vote-counter/src/VoteCounter.test.ts)

