/**
 * @api {get} /api/drugs/:id Retrieve drug information and its alternatives
 * @apiName GetDrugById
 * @apiGroup Drugs
 * 
 * @apiParam {String} id The unique identifier of the drug.
 * 
 * @apiHeader {String} Authorization Bearer token for authentication.
 * 
 * @apiSuccess {Object} drug The drug information.
 * @apiSuccess {Number} drug.id The unique identifier of the drug.
 * @apiSuccess {String} drug.name The name of the drug.
 * @apiSuccess {Number} drug.qoh The quantity on hand (QoH) of the drug.
 * @apiSuccess {Object[]} alternatives List of alternative drugs.
 * @apiSuccess {Number} alternatives.id The unique identifier of the alternative drug.
 * @apiSuccess {String} alternatives.name The name of the alternative drug.
 * @apiSuccess {Number} alternatives.qoh The quantity on hand (QoH) of the alternative drug.
 * 
 * @apiError {Object} 400 Drug not found.
 * @apiError {String} 400.message Error message indicating that the drug was not found.
 * 
 * @apiError {Object} 500 Internal Server Error.
 * @apiError {String} 500.message Error message indicating an internal server error.
 * 
 * @apiDescription This endpoint retrieves the details of a specific drug identified by its ID, 
 * including its name, quantity on hand (QoH), and a list of alternative drugs. The user must be 
 * authenticated to access this endpoint.
 * 
 * @apiExample {curl} Example usage:
 *     curl -H "Authorization: Bearer <token>" -X GET http://localhost:3000/api/drugs/123
 */
