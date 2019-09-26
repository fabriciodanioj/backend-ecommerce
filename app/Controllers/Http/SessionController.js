class SessionController {
  async store({ request, auth }) {
    const { email, password } = request.only([
      'email',
      'password',
      'user',
      'username',
    ]);

    const { token } = await auth.attempt(email, password);

    return { token };
  }
}

module.exports = SessionController;
