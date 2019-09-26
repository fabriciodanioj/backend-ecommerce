/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Routes = use('Route');

Routes.post('/sessions', 'SessionController.store').validator('Session');
Routes.post('/forgot', 'ForgotPasswordController.store').validator('Forgot');
Routes.post('/reset', 'ResetPasswordController.store').validator('Reset');
