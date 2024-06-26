const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const {setTimeout} = require("timers/promises");
const path = require('path');
const chokidar = require('chokidar');
const fs = require('fs/promises');

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

const downloadPath = path.resolve(__dirname, 'pending');
const finalPath = path.resolve(__dirname, 'downloads');



const scrapper = async (vars) => {
    let browser;
    let userAgent;
    const args = []
    if (vars.ENV === 'QA') {
        browser = await puppeteer.launch({
            headless: false, //solo para ambiente local
            args: [
                '--enable-javascript',
                `--download.default_directory=${downloadPath}`,
                '--disable-setuid-sandbox',
                '--no-sandbox',
                '--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure',
                '--disable-web-security'
            ]
        });
    } else {
        browser = await puppeteer.launch({
            //headless: false, //solo para ambiente local
            args: [
                '--enable-javascript',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                `--download.default_directory=${downloadPath}`
            ]
        });
    }



    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.continue();
    });


    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadPath })
    console.log('levantando browser')

    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36")

    const timeout = 60000;
    page.setDefaultTimeout(timeout);
    await page.setViewport({width: 1000, height: 1000});
    await page.goto(vars.URL, {waitUntil: ["domcontentloaded", "networkidle0"]});
    //await page.waitForNavigation()
    //await page.goto(vars.URL, {waitUntil: ["domcontentloaded", "networkidle0"]});
    await typeFunction(page, vars.USER_RUT, '#rut')
    await typeFunction(page, vars.USER_CLAVE, '#pass')
    await clickFunction(page, '#btnLogin')
    await page.waitForNavigation({waitUntil:["domcontentloaded","networkidle0"]})
    await page.goto('https://nwm.bancoestado.cl/content/bancoestado/cl/es/home/menu-lateral/transferir/a-terceros.html',{waitUntil:["domcontentloaded","networkidle0"]});

    //buscar destinatario
    const inputField = await page.waitForSelector('#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > section > msd-wizard-operation > div > div.wop_container__step.ng-tns-c98-0.wop_container__step--active > div > div > msd-tef > section > div > div.msd-tef-header > div.msd-tef-header__search > form > input');
    await inputField.click();
    await inputField.type(vars.DESTI_NROCTA);

    await setTimeout(2000)

    const contenedorMensaje = await page.waitForSelector('#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > section > msd-wizard-operation > div > div.wop_container__step.ng-tns-c98-0.wop_container__step--active > div > div > msd-tef > section > div > div.msd-tef-content');
    // Obtener el contenido del mensaje
    const mensajeTexto = await page.evaluate(el => el.textContent, contenedorMensaje);
    console.log(`Mensaje capturado: ${mensajeTexto}`);

    if(mensajeTexto === 'No hemos encontrado destinatarios para tu búsqueda') {
        await setTimeout(6000)
        console.log('ya espere los 10 seg mi rey')
        //apretar boton nuevo destinatario
        await clickFunction(page,'#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > section > msd-wizard-operation > div > div.wop_container__step.ng-tns-c98-0.wop_container__step--active > h3 > button')
        //agregar nuevo destinatario

        await setTimeout(2000)

        //rut
        const inputElement = await page.waitForSelector('#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div:nth-child(6) > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > app-nuevo-destinatario > section > msd-card-default > div > form > div:nth-child(1) > input');
        await inputElement.type(vars.DESTI_RUT);


        //Nombre
        await page.type(
            '#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > app-nuevo-destinatario > section > msd-card-default > div > form > div:nth-child(2) > input\n',
            vars.DESTI_NOMBRE
        );
        //Alias
        await page.type(
            '#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > app-nuevo-destinatario > section > msd-card-default > div > form > div:nth-child(3) > input\n',
            vars.DESTI_ALIAS
        );

        //BAnco
        await page.type(
            '#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > app-nuevo-destinatario > section > msd-card-default > div > form > div:nth-child(4) > select\n',
            vars.DESTI_BANCO
        );

        //TIpo CUENTA
        await page.type(
            '#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > app-nuevo-destinatario > section > msd-card-default > div > form > div:nth-child(5) > select\n',
            vars.DESTI_TIPOCTA
        );

        //NRO CUENTA
        await page.type(
            '#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > app-nuevo-destinatario > section > msd-card-default > div > form > div:nth-child(6) > input\n',
            vars.DESTI_NROCTA
        );

        //EMAIL
        await typeFunction(page,vars.DESTI_MAIL,'#mailAddressee')

        await setTimeout(2000)

        const radioButton = await page.waitForSelector('#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div:nth-child(6) > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > app-nuevo-destinatario > section > msd-card-default > div > app-metodos-de-autorizacion > msd-authorization > div > div:nth-child(2) > div:nth-child(1) > div > span');
        await radioButton.click();

        await clickFunction(page,'#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > app-nuevo-destinatario > section > div.buttons-flex.ng-star-inserted > button.msd-button.msd-button--primary.buttons-flex__btn')


        await setTimeout(1000)

        try {
            // Esperar a que el div esté presente en la página
            const modalDiv = await page.waitForSelector('div.msd-bepass-modal--open.activo', { timeout: 1000 });

            // El selector fue encontrado, realizar acciones con el elemento
            console.log('El elemento div.msd-bepass-modal--open.activo fue encontrado.');

            do{
                if(modalDiv){
                    await setTimeout(180000)
                }else{
                    await setTimeout(2000)
                    await clickFunction(page,'#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > app-nuevo-destinatario > section > div.buttons-flex.ng-star-inserted > button.msd-button.msd-button--primary.buttons-flex__btn')

                }
            }while(!modalDiv);

        } catch (error) {
            // El selector no fue encontrado dentro del tiempo de espera
            console.log('El elemento div.msd-bepass-modal--open.activo no se encontró en la página.');
        }
        /*
        try {
            // Esperar a que el div esté presente en la página
            const modalDiv = await page.waitForSelector('div.msd-bepass-modal--open.activo', { timeout: 5000 });
            // Capturar el texto del div
            const modalText = await page.evaluate(div => div.textContent, modalDiv);
            if(modalText.trim().length <= 0){
                console.log("no hay data")
            }else{
                console.log(modalText);

            }
        } catch (error) {
            console.log('El elemento div.msd-bepass-modal--open.activo no se encontró en la página.');
        }
        */

        /*const modalDiv = await page.waitForSelector('div.msd-bepass-modal--open.activo');
        const modalText = await page.evaluate(div => div.textContent, modalDiv);
        console.log(modalText);*/

    } else{

         const elemento = await page.waitForSelector('#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > section > msd-wizard-operation > div > div.wop_container__step.ng-tns-c98-0.wop_container__step--active > div > div > msd-tef > section > div > div.msd-tef-content > tef-list > div > div > div:nth-child(3) > div.tef-list-item__dataDuplicate.ng-star-inserted');
         await elemento.click();

         await typeFunction(page,vars.DESTI_MONTO,'#amount')

         console.log('monto digitado')
         const inputElement = await page.waitForSelector('input[id="message "]');
         await inputElement.click();
         await inputElement.type('prueba');

         console.log('mensaje escrito')

         await setTimeout(2000)
         console.log('2 segundos esperados')
         const radioButton = await page.waitForSelector('#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > section > msd-wizard-operation > div > div.wop_container__step.ng-tns-c98-0.wop_container__step--active > div > div > app-form-tef > div > form > msd-card-default > app-metodos-de-autorizacion > msd-authorization > div > div:nth-child(2) > div.check-bepass.ng-star-inserted > div > span');
         await radioButton.click();

         await clickFunction(page,'#spa-root > app-main > div > aem-page > aem-model-provider > aem-responsivegrid > div.aem-GridColumn.aem-GridColumn--default--12.aem-GridColumn--default--none.aem-GridColumn--offset--default--0 > aem-responsivegrid > div:nth-child(3) > app-tef-web-app-third-wrapper > tef-web-app > app-transferencia-a-terceros > section > msd-wizard-operation > div > div.wop_container__step.ng-tns-c98-0.wop_container__step--active > div > div > app-form-tef > div > form > div > button')

         await setTimeout(2000)

    }
}


const downloadPromise = async (empresa) => {
    const date = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
    const watcher = chokidar.watch(downloadPath, {awaitWriteFinish: true});
    return new Promise((resolve, reject) => {
        watcher.on('add', async (filepath) => {
            const downloadedFilename = path.basename(filepath);
            const newFilename = `Cartola_SCOTIABANK_${empresa}_${date}.txt`;
            const oldPath = path.join(downloadPath, downloadedFilename);
            const newPath = path.join(finalPath, newFilename);

            try {
                await fs.rename(oldPath, newPath);
                console.log('Archive renombrado exitosamente.');
                await watcher.close();
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    });
};

async function typeFunction(page, value, idSelector, iFrameSelector = null) {
    if (iFrameSelector) {
        const frame = await page.waitForSelector(iFrameSelector);
        const frameHandle = await frame.contentFrame();
        const selector = await frameHandle.waitForSelector(idSelector);
        await selector.type(value);
    } else {
        const selector = await page.waitForSelector(idSelector);
        await selector.type(value);
    }
}

async function clickFunction(page, idSelector, iFrameSelector = null) {
    if (iFrameSelector) {
        const frame = await page.waitForSelector(iFrameSelector);
        const frameHandle = await frame.contentFrame();
        const selector = await frameHandle.waitForSelector(idSelector);
        await selector.click();
    } else {
        const selector = await page.waitForSelector(idSelector);
        await selector.click();
    }
}

async function selectFunction(page, value, selectSelector, iFrameSelector = null) {
    if (iFrameSelector) {
        const frame = await page.waitForSelector(iFrameSelector);
        const frameHandle = await frame.contentFrame();
        const selectElement = await frameHandle.waitForSelector(selectSelector);
        await frameHandle.evaluate((selectElement, value) => {
            const options = selectElement.options;
            for (let option of options) {
                if (option.value === value) {
                    option.selected = true;
                    selectElement.dispatchEvent(new Event('change', {bubbles: true}));
                    break;
                }
            }
        }, selectElement, value);
    } else {
        const selectElement = await page.waitForSelector(selectSelector);
        await page.evaluate((selectElement, value) => {
            const options = selectElement.options;
            for (let option of options) {
                if (option.value === value) {
                    option.selected = true;
                    selectElement.dispatchEvent(new Event('change', {bubbles: true}));
                    break;
                }
            }
        }, selectElement, value);
    }
}

async function printSelect(page, idSelect, iFrameSelector = null) {
    if (iFrameSelector) {
        const frame = await page.waitForSelector(iFrameSelector);
        const frameHandle = await frame.contentFrame();
        const selectElement = await frameHandle.$(idSelect);

        return await selectElement.$$eval('option', options =>
            options.map(option => option.value)
        );
    } else {
        const selectElement = await page.$(idSelect);

        return await selectElement.$$eval('option', options =>
            options.map(option => option.value)
        );
    }
}


async function observer(page, selector) {
    try {
        await page.waitForSelector(selector);
        await page.evaluate(selector => {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (!element) {
                    reject('Elemento no encontrado');
                }

                const observer = new MutationObserver((mutations, observer) => {
                    resolve();
                    observer.disconnect();
                });

                observer.observe(element, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });
            });
        }, selector);
    } catch (error) {
        console.log('no hubo ningun cambio en la tabla. ', error);
    }
}

module.exports = {scrapper}