const { test, trait } = use('Test/Suite')('Forgot password');
const { subHours, format } = require('date-fns');

const Mail = use('Mail');
const Hash = use('Hash');
const Database = use('Database');

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */

trait('Test/ApiClient');
trait('DatabaseTransactions');

test(`It should send an email with intructions to change password`, async ({
  assert,
  client,
}) => {
  Mail.fake();

  const email = 'fabriciodanioj@gmail.com';

  const User = await Factory.model('App/Models/User').create({ email });

  await client
    .post('/forgot')
    .send({ email })
    .end();

  const token = await User.tokens().first();
  const recentEmail = Mail.pullRecent();

  assert.equal(recentEmail.message.to[0].address, email);

  assert.include(token.toJSON(), {
    type: 'forgotpassword',
  });

  Mail.restore();
});

test('It should reset password', async ({ assert, client }) => {
  const email = 'fabriciodanioj@gmail.com';

  const user = await Factory.model('App/Models/User').create({ email });

  const userToken = await Factory.model('App/Models/Token').make();

  await user.tokens().save(userToken);

  await client
    .post('/reset')
    .send({
      token: userToken.token,
      password: '123456789',
      password_confirmation: '123456789',
    })
    .end();

  await user.reload();
  const checkPassword = await Hash.verify('123456789', user.password);

  assert.isTrue(checkPassword);
});

test('It should reject the change of password after 2 hours of forgot password request', async ({
  client,
}) => {
  const email = 'fabriciodanioj@gmail.com';

  const user = await Factory.model('App/Models/User').create({ email });

  const userToken = await Factory.model('App/Models/Token').make();

  await user.tokens().save(userToken);

  const dateWithSub = format(subHours(new Date(), 2), 'yyyy-MM-dd HH:ii:ss');

  await Database.table('tokens')
    .where('token', userToken.token)
    .update('created_at', dateWithSub);

  await userToken.reload();

  const response = await client
    .post('/reset')
    .send({
      token: userToken.token,
      password: '123456789',
      password_confirmation: '123456789',
    })
    .end();

  response.assertStatus(400);
});
