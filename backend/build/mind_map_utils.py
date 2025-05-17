def get_article_position(index, total_articles, source_index, source_y_base, base_x=900, x_spacing=300, y_spacing=80):
    """
    Compute the (x, y) position of an article node to avoid overlap and center-align vertically.

    Args:
        index (int): Index of the article in its group.
        total_articles (int): Total articles for the current source.
        source_index (int): Index of the source in unique source list.
        source_y_base (float): Y-position of the source node.
        base_x (int): Starting x-position for first article column.
        x_spacing (int): Horizontal spacing between sources.
        y_spacing (int): Vertical spacing between articles.

    Returns:
        dict: A dictionary with 'x' and 'y' coordinates.
    """
    x = base_x + source_index * x_spacing
    y = source_y_base + (index - (total_articles - 1) / 2) * y_spacing
    return {"x": x, "y": y}
