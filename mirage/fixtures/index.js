/*
 * Mirage JS guide on Fixtures: https://miragejs.com/docs/data-layer/fixtures
 */

   /**
    * @summary Submit a claim
    * @type {fixture}
    * @name - sbSubmitAClaimFixture
    * @memberof SB_Claim_Rest_controller.php
    * @module mirage/fixtures/sbSubmitAClaimFixture
    */
   import sbSubmitAClaimFixture from '@mirage/fixtures/sbSubmitAClaimFixture.json';
   /**
    * @summary  Get a claim by id
    * @type {fixture}
    * @name - sbGetClaimByIdFixture
    * @memberof SB_Claim_Rest_controller.php
    * @module mirage/fixtures/sbGetClaimByIdFixture
    */
   import sbGetClaimByIdFixture from '@mirage/fixtures/sbGetClaimByIdFixture.json';
   /**
    * @summary get claims by user
    * @type {fixture}
    * @name - sbGetClaimsForUserFixture
    * @memberof SB_Claim_Rest_controller.php
    * @module mirage/fixtures/sbGetClaimsForUserFixture
    */
   import sbGetClaimsForUserFixture from '@mirage/fixtures/sbGetClaimsForUserFixture.json';
   /**
    * @summary Get ytd earnings for the account
    * @type {fixture}
    * @name - sbGetYTDEarningsForUserFixture
    * @memberof SB_Claim_Rest_controller.php
    * @module mirage/fixtures/sbGetYTDEarningsForUserFixture
    */
   import sbGetYTDEarningsForUserFixture from '@mirage/fixtures/sbGetYTDEarningsForUserFixture.json';
   /**
    * @summary SB Get ytd earnings for account
    * @type {fixture}
    * @name - sbGetYTDEarningsForAccountFixture
    * @memberof SB_Claim_Rest_controller.php
    * @module mirage/fixtures/sbGetYTDEarningsForAccountFixture
    */
   import sbGetYTDEarningsForAccountFixture from '@mirage/fixtures/sbGetYTDEarningsForAccountFixture.json';



export default { 
    sbSubmitAClaimFixture,
    sbGetClaimByIdFixture,
    sbGetClaimsForUserFixture,
    sbGetYTDEarningsForUserFixture,
    sbGetYTDEarningsForAccountFixture,
};