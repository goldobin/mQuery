/**
 * Created by .
 * User: ogoldobin
 * Date: 01/06/11
 * Time: 13:14
 * To change this template use File | Settings | File Templates.
 */


function caseNumberMessage(i) {
    var NUMBER_SUFFIXES = ["st", "nd", "d"],
        suffix = NUMBER_SUFFIXES[i];
    ok(true, "Running " + (i + 1) + "-" + (suffix !== undefined ? suffix : "th") + " case");
}
