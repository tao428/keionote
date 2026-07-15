import { Router } from 'express';
import { ItemController, uploadImagesMiddleware } from '../controllers/item.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, ItemController.listItems);
router.get('/:id', authenticateToken, ItemController.getItem);
router.post('/', authenticateToken, uploadImagesMiddleware, ItemController.createItem);
router.put('/:id', authenticateToken, ItemController.updateItem);
router.delete('/:id', authenticateToken, ItemController.deleteItem);

export default router;
