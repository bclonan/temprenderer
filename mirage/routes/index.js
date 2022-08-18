
// TODO : Import your request placeholder sample here
// master_routes_list : [{"resource_name" : "someEndpointSampleFixture, "isGet" : true}]

/*
 * Mirage JS guide on Routes: https://miragejs.com/docs/route-handlers/functions
 */

export default function routes() {
    this.namespace = 'api';



    /* 
     * sbSubmitAClaim
     * @version 1
     * @summary Submit a claim
     * @type {mirage.resource} - handles POST route functions
     * @http POST
     * @memberof SB_Claim_Rest_controller.php
     * @module @mirage/routes
     */
    this.post('/sb-claims', (schema, request) => {
      let attrs = JSON.parse(request.requestBody)
      console.log(attrs)
       // TODO : Finish your request body
      debugger
    })



     /* 
     * sbGetClaimById
     * @version 1
     * @summary  Get a claim by id
     * @type {mirage.resource} handles all get post update and delete http functions
     * @http GET
     * @memberof SB_Claim_Rest_controller.php
     * @module @mirage/routes
     * @example <caption>Example Get.</caption>
     *  fetch("sb-claims/13")
     *    .then(res => res.json())
     *    .then(({ sbGetClaimById }) => {
     *   setProducts(prettyJson( sbGetClaimById));
     * });
     */
     this.resource('/sb-claims/:id');


     /* 
     * sbGetClaimsForUser
     * @version 1
     * @summary get claims by user
     * @type {mirage.resource} handles all get post update and delete http functions
     * @http GET
     * @memberof SB_Claim_Rest_controller.php
     * @module @mirage/routes
     * @example <caption>Example Get.</caption>
     *  fetch("sb-claims/forUser/38194  ")
     *    .then(res => res.json())
     *    .then(({ sbGetClaimsForUser }) => {
     *   setProducts(prettyJson( sbGetClaimsForUser));
     * });
     */
     this.resource('/sb-claims/forUser/:userId');


     /* 
     * sbGetYTDEarningsForUser
     * @version 1
     * @summary Get ytd earnings for the account
     * @type {mirage.resource} handles all get post update and delete http functions
     * @http GET
     * @memberof SB_Claim_Rest_controller.php
     * @module @mirage/routes
     * @example <caption>Example Get.</caption>
     *  fetch("sb-claims/forUser/38194/ytdEarnings")
     *    .then(res => res.json())
     *    .then(({ sbGetYTDEarningsForUser }) => {
     *   setProducts(prettyJson( sbGetYTDEarningsForUser));
     * });
     */
     this.resource('sb-claims/forUser/:accountId/ytdEarnings');


     /* 
     * sbGetYTDEarningsForAccount
     * @version 1
     * @summary SB Get ytd earnings for account
     * @type {mirage.resource} handles all get post update and delete http functions
     * @http GET
     * @memberof SB_Claim_Rest_controller.php
     * @module @mirage/routes
     * @example <caption>Example Get.</caption>
     *  fetch("sb-claims/forAccount/42795/ytdEarnings")
     *    .then(res => res.json())
     *    .then(({ sbGetYTDEarningsForAccount }) => {
     *   setProducts(prettyJson( sbGetYTDEarningsForAccount));
     * });
     */
     this.resource('sb-claims/forAccount/:accountId/ytdEarnings');

  
  }