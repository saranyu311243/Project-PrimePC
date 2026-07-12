import { useState } from 'react'
import { FavoriteContext } from './favorite-context'

const readFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem('primepc-favorites')) ?? []
  } catch {
    return []
  }
}

function FavoriteProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(readFavorites)

  const toggleFavorite = (id) => {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
      localStorage.setItem('primepc-favorites', JSON.stringify(next))
      return next
    })
  }

  return <FavoriteContext.Provider value={{ favoriteIds, toggleFavorite, isFavorite: (id) => favoriteIds.includes(id) }}>{children}</FavoriteContext.Provider>
}

export default FavoriteProvider
