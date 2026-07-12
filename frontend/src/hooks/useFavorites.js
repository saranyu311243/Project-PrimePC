import { useContext } from 'react'
import { FavoriteContext } from '../context/favorite-context'

export const useFavorites = () => {
  const favorites = useContext(FavoriteContext)
  if (!favorites) throw new Error('useFavorites must be used inside FavoriteProvider')
  return favorites
}
