import { Router } from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';
import FilesController from '../controllers/FilesController';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

router.post('/users', UsersController.postNew);
router.get('/users/me', AuthController.verifyToken, UsersController.getMe);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.verifyToken, AuthController.getDisconnect);

router.post('/files', AuthController.verifyToken, FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.put('/files/:id/publish', AuthController.verifyToken, FilesController.putPublish);
router.put('/files/:id/unpublish', AuthController.verifyToken, FilesController.putUnpublish);
router.get('/files/:id/data', FilesController.getFile);

AuthController.verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(401).send({ error: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).send({ error: 'Failed to authenticate token.' });
  }
};

export default router;
