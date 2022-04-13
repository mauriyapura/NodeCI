
const Page = require('./helpers/page');

let page;
const mongoose = require("mongoose");

beforeEach(async ()=>{
        
    page =  await Page.build();
    await page.goto("http://localhost:3000");
});

afterEach(async ()=>{
    // We close the browser after test
    await page.close();
})
afterAll(async ()=>{
    mongoose.disconnect()
})


test('The header has the correct text', async ()=>{    

   //const text = await page.$eval('a.brand-logo', el => el.innerHTML); 
   const text = await page.getContentsOf('a.brand-logo'); 
   expect(text).toEqual('Blogster');   
});

test('clicking login starts oauth flow', async ()=>{

    await page.click('.right a');
    const url = await page.url();
    console.log("probando github actions")
    expect(url).toMatch(/accounts\.google\.com/)
});

test('When signed in, shows logout button', async()=>{

    await page.login();

    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML );
    expect(text).toEqual('Logout');   

});

