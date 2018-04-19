import $ from "jquery";

export function getReadableHashRateString(hashrate) {
    const byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH'];
    let i = 0;
    while (hashrate > 1000) {
        hashrate = hashrate / 1000;
        i++;
    }
    return hashrate.toFixed(2) + byteUnits[i];
}

export function getReadableCoins(stats, coins, digits, withoutSymbol) {
    let amount;
    if (stats.config.min_denom) {
        const units = $('meta[property="x:coin:units"]').attr('content');
        amount = (parseInt(coins || 0) / units).toFixed(digits || units.toString().length - 1);
    } else {
        amount = (parseInt(coins || 0) / stats.config.coinUnits).toFixed(digits || stats.config.coinUnits.toString().length - 1);
    }
    return amount + (withoutSymbol ? '' : (' ' + stats.config.symbol));
}

export function floatToString(float) {
    return float.toFixed(2).replace(/[0\.]+$/, '');
}

export function shorten(text = '', maxLength = 9) {
    return text.length > maxLength ? text.substr(0, maxLength - 3) + '...' : text;
}

export function getReadableNumber(hashrate) {
    const byteUnits = ['', ' K', ' M', ' G', ' T', ' P'];
    let i = 0;
    while (hashrate > 1000) {
        hashrate = hashrate / 1000;
        i++;
    }
    return hashrate.toFixed(3) + byteUnits[i];
}