/**
 * @file
 * @author huangzongzhe
 * TODO: details modified to Resource
*/

import React from 'react';
import {Route} from 'react-router-dom';

import HomePage from './pages/Home/Home';
import BlocksPage from './pages/Blocks/Blocks';
import BlockDetailPage from './pages/BlockDetail/BlockDetail';
import AddressPage from './pages/Address/Address';
import TxsPage from './pages/Txs/Txs';
import TxsDetailPage from './pages/TxsDetail/TxsDetail';
import VotePage from './pages/Vote/Vote';
import Resource from './pages/Resource/Resource';
import ResourceDetail from './pages/ResourceDetail/ResourceDetail';
import Viewer from './pages/Viewer';
import Proposal from './pages/Proposal';

// Notice: we need register the route in Breadcurmb.js.
// If not, we will always turn to '/'
export default () => [
    <Route exact path='/' component={HomePage} key='index' />,
    <Route path='/blocks' exact component={BlocksPage} key='blocks' />,
    <Route path='/unconfirmedBlocks' exact component={BlocksPage} key='unconfirmedBlocks' />,
    <Route path='/block/:id' component={BlockDetailPage} key='blockdetail' />,
    // <Route path='/address' exact component={AddressPage} key='address' />,
    <Route path='/address/:id' component={AddressPage} key='address' />,
    <Route path='/txs' exact component={TxsPage} key='transcations' />,
    <Route path='/unconfirmedTxs' exact component={TxsPage} key='unconfirmedTxs' />,
    <Route path='/txs/block' component={TxsPage} key='txsblock' />,
    <Route path='/tx/:id' component={TxsDetailPage} key='txsdetail' />,
    <Route path='/vote' component={VotePage} key='vote' />,
    <Route path='/resource' component={Resource} key='resource' />,
    <Route path='/resourceDetail/:id' component={ResourceDetail} key='resourceDetail' />,
    <Route path='/contract' component={Viewer} key='contract' />,
    <Route path='/proposal' component={Proposal} key='proposal' />
];
