/**
 * Created by .
 * User: ogoldobin
 * Date: 01/06/11
 * Time: 13:14
 * To change this template use File | Settings | File Templates.
 */

// TODO: After split of the tests that use this function this function should be removed
function caseNumberMessage(i) {
    var NUMBER_SUFFIXES = ["st", "nd", "d"],
        suffix = NUMBER_SUFFIXES[i];
    ok(true, "Running " + (i + 1) + "-" + (suffix !== undefined ? suffix : "th") + " case");
}

function toDo() {
    ok(false, "TODO: Test should be implemented")
}