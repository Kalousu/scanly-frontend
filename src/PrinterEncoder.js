export class PrinterEncoder{
    #commands;
    #ESC;
    #GS;
    static #cp850 = {
        'ä': 0x84, 'ö': 0x94, 'ü': 0x81,
        'Ä': 0x8E, 'Ö': 0x99, 'Ü': 0x9A,
        'ß': 0xE1, '€': 0xD5,
        '░': 0xB0, '▒': 0xB1, '▓': 0xB2,
        '█': 0xB3
    };
 
    constructor(){
        this.#commands = []
        this.#ESC = 0x1B
        this.#GS = 0x1D
    }

    #formatAmount(value) {
        return new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: false
        }).format(Number(value || 0));
    }
 
    #encode(text) {
        const bytes = [];
        for (const char of text) {
            if (PrinterEncoder.#cp850[char] !== undefined) {
                bytes.push(PrinterEncoder.#cp850[char]);
            } else {
                bytes.push(char.charCodeAt(0));
            }
        }
        return bytes;
    }
 
    init(){
        this.#commands.push([this.#ESC, 0x40])
        return this;
    }
 
    setCodepage(){
        this.#commands.push([this.#ESC, 0x74, 0x02]);
        return this;
    }
 
    setGerman(){
        this.#commands.push([this.#ESC, 0x52, 0x02])
        return this
    }
 
    center(){
        this.#commands.push([this.#ESC, 0x61, 0x01])
        return this;
    }
 
    print(text){
        this.#commands.push(...this.#encode(text))
        return this;
    }
 
    println(text){
        this.#commands.push(...this.#encode(text + '\n'))
        return this;
    }
 
    printScanlyInfo(){
        this.print("           ░░░░░░░░░░           ")
        this.print("      ░░▒▓▓▒▒▒▒▒▒▓█▓▓▓▓▒▒░      ")
        this.print("    ░▒▓░            ▒▒░  ▒▒░    ")
        this.print("    ░▓               ▓▒   ▓░    ")
        this.print("    ░▓░             ▒▒░  ░▒░    ")
        this.print("     ░▓             ▓▒   ▓▒     ")
        this.print("     ░▓             ▓▒   ▓░     ")
        this.print("     ░▓             ▓▒   ▓░     ")
        this.print("     ▒▓             ▓▒  ░▓░     ")
        this.print("     ░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░      ")
        this.print("                                ")
        this.feed(1);
        this.print("EINFACH SCANNEN! Das ist Scanly\n")
        return this;
    }
 
    printPrice(article, priceGross, priceSingle, amount, taxLabel){
        let width = 32;
    
        const priceGrossStr = this.#formatAmount(priceGross);
        const priceSingleStr = this.#formatAmount(priceSingle);
        const amountStr = this.#formatAmount(amount);
    
        let articleWidth = article.toString().length;
        let priceWidth = priceGrossStr.length;
        let space = width - articleWidth - priceWidth - 2;
    
        let res = "";
        res += article;
        for(let i = 0; i < space; i++){
            res += " ";
        }
        res += priceGrossStr + " " + taxLabel;
        res = res.substring(0, width);
        this.println(res);
    
        if(amount > 1){
            let widthAmountPuffer = 6;
            let widthPriceSingleBuffer = 6;
            let widthAmount = amountStr.length;
            let widthPriceSingle = priceSingleStr.length;
            let resAmount = "";
            let loop1 = widthAmountPuffer - widthAmount;
            let loop2 = widthPriceSingleBuffer - widthPriceSingle;
            for(let i = 0; i < loop1; i++){
                resAmount += " ";
            }
            resAmount += amountStr;
            resAmount += " x  ";
            for(let i = 0; i < loop2; i++){
                resAmount += " ";
            }
            resAmount += priceSingleStr;
            for(let i = 0; i < 16; i++){
                resAmount += " ";
            }
            resAmount = resAmount.substring(0, width);
            this.println(resAmount);
        }
        return this;
    }
 
    printSum(sum, label = "TOTAL:"){
        let width = 32;
        const sumStr = this.#formatAmount(sum);
        let res = `${label} `;
        let space = width - res.length - sumStr.length;
        for(let i = 0; i < space; i++){
            res += " ";
        }
        res += sumStr;
        res = res.substring(0, 32);
        this.println(res);
        return this;
    }
 
    printTaxGroupTable(taxGroups, header = "VAT% VAT   Net = Gross") {
        this.println(header);
        this.lineSeparator();
        taxGroups.forEach(group => {
            const label = group.label.padEnd(2);
            const rate = (group.rate * 100).toFixed(0).padStart(2) + "%";
            const tax = this.#formatAmount(group.tax).padStart(6);
            const net = this.#formatAmount(group.net).padStart(6);
            const gross = this.#formatAmount(group.gross).padStart(6);
            this.println(`${label} ${rate} ${tax} ${net} ${gross}`);
        });
        this.lineSeparator();
        return this;
    }
 
    printCurrencyLabel(label = ""){
        const currencyLabel = String(label).slice(0, 6)
        const padding = Math.max(0, 30 - currencyLabel.length)
        this.#commands.push(...this.#encode(`${" ".repeat(padding)}${currencyLabel} \n`))
        return this;
    }
 
    lineSeparator(){
        this.#commands.push(...this.#encode("--------------------------------\n"))
        return this;
    }
 
    setBold(){
        this.#commands.push([this.#ESC, 0x45, 0x01])
        return this;
    }
 
    unsetBold(){
        this.#commands.push([this.#ESC, 0x45, 0x00])
        return this;
    }
 
    setUnderline(){
        this.#commands.push([this.#ESC, 0x2D, 0x01])
        return this;
    }
 
    unsetUnderline(){
        this.#commands.push([this.#ESC, 0x2D, 0x00])
        return this;
    }
 
    setItalic(){
        this.#commands.push([this.#ESC, 0x34])
        return this
    }
 
    unsetItalic(){
        this.#commands.push([this.#ESC, 0x35])
        return this
    }
 
    beep(){
        this.#commands.push([0x07])
        return this
    }
 
    feed(num = 1){
        for(let i = 0; i < num; i++){
            this.#commands.push([0x0A]);
        }
        return this;
    }
 
    cut(){
        this.#commands.push([this.#GS, 0x56, 0x01])
        return this;
    }
 
    encode(){
        return new Uint8Array(this.#commands.flat());
    }
}
