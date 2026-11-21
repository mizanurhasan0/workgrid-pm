import { getImage } from './image.entity';

export default function image() {
  this.route.get('/images/:path', getImage());
}