/**
 * @file
 * @author zhouminghui
 * Forms need to be split up
*/

import React, {PureComponent} from 'react';
import Button from '../../Button/Button';
import {Table, message} from 'antd';
import getCurrentVotingRecord from '../../../utils/getCurrentVotingRecord';
import getCandidatesList from '../../../utils/getCandidatesList';
import getHexNumber from '../../../utils/getHexNumber';
import './VoteTable.less';

let pageSize = 20;
let page = 0;
export default class VoteTable extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            nodeName: null,
            currentWallet: this.props.currentWallet,
            refresh: 0,
            loading: false,
            pagination: {
                showQuickJumper: true,
                total: 0,
                showTotal: total => `Total ${total} items`,
                onChange: () => {
                    // const setTop = this.refs.voting.offsetTop;
                    // window.scrollTo(0, setTop);
                }
            },
            contracts: null,
            allVotes: 0
        };
    }
    // 定义表格的字段与数据
    // 拆出去没办法获取state的状态
    getVoteInfoColumn() {
        const voteInfoColumn = [
            {
                title: 'Serial number',
                dataIndex: 'serialNumber',
                key: 'serialNumber',
                align: 'center'
            },
            {
                title: 'Node name',
                dataIndex: 'nodeName',
                key: 'nodeName',
                align: 'center'
            },
            {
                title: 'Term of office',
                dataIndex: 'term',
                key: 'term',
                align: 'center'
            },
            {
                title: 'Current block',
                dataIndex: 'block',
                key: 'block',
                align: 'center'
            },
            {
                title: 'Number of votes obtained',
                dataIndex: 'vote',
                key: 'vote',
                align: 'center',
                render: vote => {
                    let barVote = vote === '-' ? 0 : vote;
                    let barWidth = (parseInt(barVote, 10) / this.state.allVotes) * 100;
                    return (
                        <div className='vote-progress'>
                            <div className='progress-out'>
                                <div className='progress-in' style={{width: barWidth + '%'}}></div>
                            </div>
                            {vote}
                        </div>
                    );
                }
            },
            {
                title: 'My vote',
                dataIndex: 'myVote',
                key: 'myVote',
                align: 'center'
            },
            {
                title: 'Operation',
                dataIndex: 'operation',
                key: 'operation',
                align: 'center',
                render: text => {
                    let isRedeem = text.vote
                    ? {background: '#097d25', margin: '5px'} : {background: '#aaa', margin: '5px'};
                    let isVote = text.redeem
                    ? {background: '#feb000', margin: '5px'} : {background: '#aaa', margin: '5px'};
                    return (
                        <div style={{textAlign: 'center'}}>
                            <Button title='Vote' style={isRedeem} click={() => {
                                    if (text.vote) {
                                        this.getVoting(text.publicKey);
                                    }
                                }
                            }
                            />
                            <Button title='Redeem' style={isVote} click={() => {
                                    if (text.redeem) {
                                        this.props.showMyVote();
                                    }
                                }
                            }
                            />
                        </div>
                    );
                }
            }
        ];
        return voteInfoColumn;
    }

    nodeListInformation = async (params = {}) => {
        const {contracts} = this.state;
        this.setState({
            loading: true
        });
        const data = getCandidatesList(this.state.currentWallet, ...params, contracts);
        let dataList = data.dataList || [];
        let currentVotingRecord = this.currentVotingRecord || [];
        let pagination = this.state.pagination;
        pagination.total = data.CandidatesNumber;
        dataList.map((item, index) => {
            let myVote = 0;
            for (let j = 0, len = currentVotingRecord.length; j < len; j++) {
                if (currentVotingRecord[j].To === item.operation.publicKey) {
                    let IsWithdrawn = currentVotingRecord[j].IsWithdrawn || false;
                    IsWithdrawn ? myVote : myVote += parseInt(currentVotingRecord[j].Count, 10);
                }
            }
            item.myVote = myVote === 0 ? '-' : myVote.toLocaleString();
            item.operation.redeem = item.myVote === '-' ? false : true;
        });
        return {
            data: dataList || [],
            pagination
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.currentWallet !== state.currentWallet) {
            return {
                currentWallet: props.currentWallet
            };
        }

        if (props.contracts !== state.contracts) {
            return {
                contracts: props.contracts
            };
        }

        if (props.refresh !== state.refresh) {
            return {
                refresh: props.refresh
            };
        }

        return null;
    }

    handleTableChange = pagination => {
        let pageOption = this.state.pagination;
        pageOption.current = pagination.current;
        this.setState({
            pagination: pageOption
        });
        page = 10 * (pagination.current - 1);
        pageSize = page + 10;
        this.getDerivedStateFromProps({
            page,
            pageSize
        }).then(result => {
            this.setState({
                loading: false,
                data: result.data,
                pagination: result.pagination
            });
        });
    };

    componentWillUnmount() {
        this.setState = () => {};
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentWallet !== this.props.currentWallet) {
            const {contracts} = this.state;
            if (contracts) {
                page = 0;
                pageSize = 10;
                let pageOption = this.state.pagination;
                pageOption.current = 1;
                this.setState({
                    pagination: pageOption,
                    allVotes: getHexNumber(contracts.consensus.GetTicketsCount().return)
                });
                this.currentVotingRecord = getCurrentVotingRecord(
                    this.props.currentWallet,
                    contracts
                ).VotingRecords;
                this.nodeListInformation(
                    {
                        page,
                        pageSize
                    }
                ).then(result => {
                    this.setState({
                        loading: false,
                        data: result.data,
                        pagination: result.pagination,
                        pagination: pageOption,
                        allVotes: getHexNumber(contracts.consensus.GetTicketsCount().return)
                    });
                });
            }
        }
        if (prevProps.refresh !== this.props.refresh) {
            const {contracts} = this.state;
            if (contracts) {
                page = 0;
                pageSize = 10;
                let pageOption = this.state.pagination;
                pageOption.current = 1;
                this.currentVotingRecord = getCurrentVotingRecord(
                    this.props.currentWallet,
                    contracts
                ).VotingRecords;
                this.nodeListInformation(
                    {
                        page,
                        pageSize
                    }
                ).then(result => {
                    this.setState({
                        loading: false,
                        data: result.data,
                        pagination: pageOption,
                        allVotes: getHexNumber(contracts.consensus.GetTicketsCount().return)
                    });
                });
            }
        }

        if (prevProps.contracts !== this.props.contracts) {
            const {contracts, currentWallet} = this.state;
            if (contracts) {
                this.currentVotingRecord = getCurrentVotingRecord(
                    currentWallet,
                    contracts
                ).VotingRecords;
                this.nodeListInformation(
                    {
                        page,
                        pageSize
                    }
                ).then(result => {
                    this.setState({
                        loading: false,
                        data: result.data,
                        allVotes: getHexNumber(contracts.consensus.GetTicketsCount().return)
                    });
                });
            }
        }
    }

    getVoting(publicKey) {
        const {data, currentWallet, contracts} = this.state;
        const len = data.length;
        for (let i = 0; i < len; i++) {
            if (data[i].operation.publicKey === publicKey) {
                this.props.obtainInfo(data[i].nodeName, data[i].operation.publicKey);
            }
        }

        window.NightElf.api({
            appName: 'hzzTest',
            method: 'CHECK_PERMISSION',
            type: 'address', // if you did not set type, it aways get by domain.
            address: currentWallet.address
        }).then(result => {
            if (result.permissions.length === 0) {
                window.NightElf.api({
                    appName: 'hzzTest',
                    method: 'OPEN_PROMPT',
                    chainId: 'AELF',
                    hostname: 'aelf.io',
                    payload: {
                        method: 'SET_PERMISSION',
                        payload: {
                            address: currentWallet.address,
                            contracts: [{
                                chainId: 'AELF',
                                contractAddress: contracts.TOKENADDRESS,
                                contractName: 'token',
                                description: 'token contract'
                            }, {
                                chainId: 'AELF',
                                contractAddress: contracts.DIVIDENDSADDRESS,
                                contractName: 'dividends',
                                description: 'contract dividends'
                            }, {
                                chainId: 'AELF',
                                contractAddress: contracts.CONSENSUSADDRESS,
                                contractName: 'consensus',
                                description: 'contract consensus'
                            }]
                        }
                    }
                }).then(result => {
                    if (result.error === 0) {
                        window.NightElf.api({
                            appName: 'hzzTest',
                            method: 'INIT_AELF_CONTRACT',
                            // hostname: 'aelf.io',
                            chainId: 'AELF',
                            payload: {
                                address: currentWallet.address,
                                contractName: 'token',
                                contractAddress: contracts.TOKENADDRESS
                            }
                        }).then(
                            window.NightElf.api({
                                appName: 'hzzTest',
                                method: 'INIT_AELF_CONTRACT',
                                // hostname: 'aelf.io',
                                chainId: 'AELF',
                                payload: {
                                    address: currentWallet.address,
                                    contractName: 'consensus',
                                    contractAddress: contracts.CONSENSUSADDRESS
                                }
                            })
                        ).then(result => {
                            if (result.error === 0) {
                                this.props.showVote();
                            }
                        });
                    }
                    else {
                        message.error(result.errorMessage, 5);
                    }
                });
            }
            else {
                result.permissions.map((item, index) => {
                    if (item.address === currentWallet.address) {
                        window.NightElf.api({
                            appName: 'hzzTest',
                            method: 'INIT_AELF_CONTRACT',
                            // hostname: 'aelf.io',
                            chainId: 'AELF',
                            payload: {
                                address: currentWallet.address,
                                contractName: 'token',
                                contractAddress: contracts.TOKENADDRESS
                            }
                        }).then(
                            window.NightElf.api({
                                appName: 'hzzTest',
                                method: 'INIT_AELF_CONTRACT',
                                // hostname: 'aelf.io',
                                chainId: 'AELF',
                                payload: {
                                    address: currentWallet.address,
                                    contractName: 'consensus',
                                    contractAddress: contracts.CONSENSUSADDRESS
                                }
                            })
                        ).then(result => {
                            if (result.error === 0) {
                                this.props.showVote();
                            }
                        });
                    }
                });
            }
        });
    }

    getRedeem(publicKey) {
        const data = this.state.data;
        const len = data.length;
        for (let i = 0; i < len; i++) {
            if (data[i].operation.publicKey === publicKey) {
                this.props.obtainInfo(data[i].nodeName, data[i].operation.publicKey);
            }
        }
        this.props.showRedeem();
    }

    render() {
        const voteInfoColumn = this.getVoteInfoColumn();
        const {data, pagination, loading}  = this.state;
        const {handleTableChange} = this;
        return (
            <div className='vote-table' style={this.props.style} ref='voting'>
                <Table
                    columns={voteInfoColumn}
                    dataSource={data}
                    onChange={handleTableChange}
                    loading={loading}
                    pagination={pagination}
                />
            </div>
        );
    }
}
