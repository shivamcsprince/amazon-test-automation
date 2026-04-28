const { test, expect } = require('@playwright/test');
const { AmazonPage } = require('../utils/AmazonPage');

test.describe('Amazon Product Search & Cart Tests', () => {

  test.setTimeout(120000);

  test('TC1: Search iPhone, add to cart, print price', async ({ page }) => {
    console.log('\n' + '═'.repeat(60));
    console.log('  TEST CASE 1: iPhone Search & Cart');
    console.log('═'.repeat(60));

    const amazon = new AmazonPage(page);
    await amazon.goto();
    await amazon.searchFor('iPhone 15');
    await amazon.clickFirstProduct();

    const productTitle = await amazon.getProductTitle();
    const productPrice = await amazon.getPrice();

    console.log('\n  ┌─────────────────────────────────────────────────┐');
    console.log('  │              📱  iPhone Found                    │');
    console.log('  ├─────────────────────────────────────────────────┤');
    console.log(`  │  Title : ${productTitle.substring(0, 47).padEnd(47)}│`);
    console.log(`  │  Price : ${productPrice.padEnd(47)}│`);
    console.log('  └─────────────────────────────────────────────────┘\n');

    await amazon.addToCart();
    const cartCount = await amazon.getCartCount();
    console.log(`  🛒  Cart count: ${cartCount}`);

    expect(productTitle).toBeTruthy();
    expect(productTitle).not.toBe('');
    console.log('\n  ✅  TEST CASE 1 PASSED\n');
  });

  test('TC2: Search Samsung Galaxy, add to cart, print price', async ({ page }) => {
    console.log('\n' + '═'.repeat(60));
    console.log('  TEST CASE 2: Samsung Galaxy Search & Cart');
    console.log('═'.repeat(60));

    const amazon = new AmazonPage(page);
    await amazon.goto();
    await amazon.searchFor('Samsung Galaxy S24');
    await amazon.clickFirstProduct();

    const productTitle = await amazon.getProductTitle();
    const productPrice = await amazon.getPrice();

    console.log('\n  ┌─────────────────────────────────────────────────┐');
    console.log('  │            📱  Galaxy Found                      │');
    console.log('  ├─────────────────────────────────────────────────┤');
    console.log(`  │  Title : ${productTitle.substring(0, 47).padEnd(47)}│`);
    console.log(`  │  Price : ${productPrice.padEnd(47)}│`);
    console.log('  └─────────────────────────────────────────────────┘\n');

    await amazon.addToCart();
    const cartCount = await amazon.getCartCount();
    console.log(`  🛒  Cart count: ${cartCount}`);

    expect(productTitle).toBeTruthy();
    expect(productTitle).not.toBe('');
    console.log('\n  ✅  TEST CASE 2 PASSED\n');
  });

});
