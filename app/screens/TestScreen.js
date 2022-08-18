import React, { useEffect, useState } from 'react';
import { View, ScrollView, SafeAreaView, TextInput } from 'react-native';

import SBButton from '@components/Button/SBButton';
import SBTextInput from '@components/TextInput/SBTextInput';
import SBContent from '@components/Content/SBContent';
import SBScreenStyles from '@theme/screen-styles';
import SBInputStyles from '@theme/input-styles';
import APITestCard from '@components/APITestCard/APITestCard';
import Service from '@constants/service';
// TODO : Import request placeholder sample for testing purposes 
import {requestPlaceholderSample} from '@mirage/request_placeholders/requestPlaceholderSample';
//Screen styles
const { apitest } = SBScreenStyles;
const { screenContentWrapper, headerContainer, inputContainer } = apitest;
let prettyJson = (input) => JSON.stringify(input, null, 4);
const TestScreen = ({ navigation }) => {
  // TODO : Create a [setter, getter] pair for each request placeholder sample
  // EXAMPLE : const [products, setProducts] = useState([]);
   const [sbSubmitAClaim, setsbSubmitAClaim] = useState([]);
   const [sbGetClaimById, setsbGetClaimById] = useState([]);
   const [sbGetClaimsForUser, setsbGetClaimsForUser] = useState([]);
   const [sbGetYTDEarningsForUser, setsbGetYTDEarningsForUser] = useState([]);
   const [sbGetYTDEarningsForAccount, setsbGetYTDEarningsForAccount] = useState([]);
  useEffect(() => {

    /**
     * sbSubmitAClaim
     * @version 1
     * @summary Submit a claim
     * @memberof SB_Claim_Rest_controller.php
     * @route - /sb-claims
     * @route_mock_sample - sb-claims
     * @interface - sbSubmitAClaim
     * @http - POST
     * @example <caption>Example Response.</caption>
     * {}
     */
    /**
     * sbGetClaimById
     * @version 1
     * @summary  Get a claim by id
     * @memberof SB_Claim_Rest_controller.php
     * @route - /sb-claims/:id
     * @route_mock_sample - sb-claims/13
     * @interface - sbGetClaimById
     * @http - GET
     * @example <caption>Example Response.</caption>
     * {"id":13,"barcode":"1173803"}
     */
    fetch("sb-claims/13")
    .then(res => res.json())
    .then(({ sbGetClaimById }) => {
      setsbGetClaimById(prettyJson(sbGetClaimById));
    });
    /**
     * sbGetClaimsForUser
     * @version 1
     * @summary get claims by user
     * @memberof SB_Claim_Rest_controller.php
     * @route - /sb-claims/forUser/:userId
     * @route_mock_sample - sb-claims/forUser/38194  
     * @interface - sbGetClaimsForUser
     * @http - GET
     * @example <caption>Example Response.</caption>
     * {"claimId":76943,"barcode":"1263353","createDate":"01\/25\/2022 13:42:08","regionName":null,"distributorName":null,"accountName":null,"statusName":"Funded","fundedDate":null,"userId":0,"userName":null,"userEmail":null,"amount":"$56.00","overdue":null,"statusId":0,"earnAsOne":null,"checksOnlyFlag":null,"adjustment":null,"errorMessage":null,"payoutDate":null,"entityType":"StickerClaimSummary"}
     */
    fetch("sb-claims/forUser/38194  ")
    .then(res => res.json())
    .then(({ sbGetClaimsForUser }) => {
      setsbGetClaimsForUser(prettyJson(sbGetClaimsForUser));
    });
    /**
     * sbGetYTDEarningsForUser
     * @version 1
     * @summary Get ytd earnings for the account
     * @memberof SB_Claim_Rest_controller.php
     * @route - sb-claims/forUser/:accountId/ytdEarnings
     * @route_mock_sample - sb-claims/forUser/38194/ytdEarnings
     * @interface - sbGetYTDEarningsForUser
     * @http - GET
     * @example <caption>Example Response.</caption>
     * {
    "ytdEarnings": 56,
    "entityType": "StickerYtdEarnings"
}
     */
    fetch("sb-claims/forUser/38194/ytdEarnings")
    .then(res => res.json())
    .then(({ sbGetYTDEarningsForUser }) => {
      setsbGetYTDEarningsForUser(prettyJson(sbGetYTDEarningsForUser));
    });
    /**
     * sbGetYTDEarningsForAccount
     * @version 1
     * @summary SB Get ytd earnings for account
     * @memberof SB_Claim_Rest_controller.php
     * @route - sb-claims/forAccount/:accountId/ytdEarnings
     * @route_mock_sample - sb-claims/forAccount/42795/ytdEarnings
     * @interface - sbGetYTDEarningsForAccount
     * @http - GET
     * @example <caption>Example Response.</caption>
     * 
     */
    fetch("sb-claims/forAccount/42795/ytdEarnings")
    .then(res => res.json())
    .then(({ sbGetYTDEarningsForAccount }) => {
      setsbGetYTDEarningsForAccount(prettyJson(sbGetYTDEarningsForAccount));
    });
   
  }, [])



  return (
    <>
    <View style={apitest}>
      <View style={screenContentWrapper}>
      <SBContent textType="header">Test Route</SBContent>
      <ScrollView>
        <APITestCard content={ sbGetClaimById } title="/sb-claims/:id" type="GET" description=" Get a claim by id" />
        <APITestCard content={ sbGetClaimsForUser } title="/sb-claims/forUser/:userId" type="GET" description="get claims by user" />
        <APITestCard content={ sbGetYTDEarningsForUser } title="sb-claims/forUser/:accountId/ytdEarnings" type="GET" description="Get ytd earnings for the account" />
        <APITestCard content={ sbGetYTDEarningsForAccount } title="sb-claims/forAccount/:accountId/ytdEarnings" type="GET" description="SB Get ytd earnings for account" />
       </ScrollView>
      </View>
    </View>
    </>
  );
}

export default TestScreen;
