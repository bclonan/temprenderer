/*
 * Guide on how to use in PSX Mobile app //todo - add this to the guide
 */
// TODO : Import your request placeholder sample here
// master_requesbulk_arrt_sample_list : [{"name" : "someEndpointSampleFixture}]

   /**
    * Submit a claim
    * @name - sbSubmitAClaimRequestSample
    * @type {requestPlaceholder}
    * @memberof SB_Claim_Rest_controller.php
    * @example <caption>Example Paramaters sbSubmitAClaimRequestSample.</caption>
    * @param {//TODO : fill in type} startDate - //TODO : Fill in description and ex.
    * @param {//TODO : fill in type}  endDate - //TODO : Fill in description and ex.
    */
   import sbSubmitAClaimRequestSample from '@mirage/request_placeholders/sbSubmitAClaimRequestSample.json';
   /**
    * get claims by user
    * @name - sbGetClaimsForUserRequestSample
    * @type {requestPlaceholder}
    * @memberof SB_Claim_Rest_controller.php
    * @example <caption>Example Paramaters sbGetClaimsForUserRequestSample.</caption>
    * @param {//TODO : fill in type} startDate - //TODO : Fill in description and ex.
    * @param {//TODO : fill in type}  endDate - //TODO : Fill in description and ex.
    */
   import sbGetClaimsForUserRequestSample from '@mirage/request_placeholders/sbGetClaimsForUserRequestSample.json';
   /**
    * Get ytd earnings for the account
    * @name - sbGetYTDEarningsForUserRequestSample
    * @type {requestPlaceholder}
    * @memberof SB_Claim_Rest_controller.php
    * @example <caption>Example Paramaters sbGetYTDEarningsForUserRequestSample.</caption>
    * @param {//TODO : fill in type} startDate - //TODO : Fill in description and ex.
    * @param {//TODO : fill in type}  endDate - //TODO : Fill in description and ex.
    */
   import sbGetYTDEarningsForUserRequestSample from '@mirage/request_placeholders/sbGetYTDEarningsForUserRequestSample.json';
   /**
    * SB Get ytd earnings for account
    * @name - sbGetYTDEarningsForAccountRequestSample
    * @type {requestPlaceholder}
    * @memberof SB_Claim_Rest_controller.php
    * @example <caption>Example Paramaters sbGetYTDEarningsForAccountRequestSample.</caption>
    * @param {//TODO : fill in type} startDate - //TODO : Fill in description and ex.
    * @param {//TODO : fill in type}  endDate - //TODO : Fill in description and ex.
    */
   import sbGetYTDEarningsForAccountRequestSample from '@mirage/request_placeholders/sbGetYTDEarningsForAccountRequestSample.json';



export default { 
      sbSubmitAClaimRequestSample,
      sbGetClaimsForUserRequestSample,
      sbGetYTDEarningsForUserRequestSample,
      sbGetYTDEarningsForAccountRequestSample,
};