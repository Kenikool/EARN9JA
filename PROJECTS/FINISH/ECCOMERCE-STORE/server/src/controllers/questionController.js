import ProductQuestion from '../models/ProductQuestion.js';
import Product from '../models/Product.js';

// @desc    Get product questions
// @route   GET /api/products/:productId/questions
// @access  Public
export const getQuestions = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await ProductQuestion.find({ product: productId })
      .populate('user', 'name avatar')
      .populate('answeredBy', 'name')
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);

    const total = await ProductQuestion.countDocuments({ product: productId });

    res.status(200).json({
      status: 'success',
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch questions',
    });
  }
};

// @desc    Ask a question
// @route   POST /api/products/:productId/questions
// @access  Private
export const askQuestion = async (req, res) => {
  try {
    const { productId } = req.params;
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Question is required',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    const newQuestion = await ProductQuestion.create({
      product: productId,
      user: req.user._id,
      question: question.trim(),
    });

    await newQuestion.populate('user', 'name avatar');

    res.status(201).json({
      status: 'success',
      data: { question: newQuestion },
    });
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to post question',
    });
  }
};

// @desc    Answer a question
// @route   PUT /api/questions/:id/answer
// @access  Private (Vendor/Admin)
export const answerQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Answer is required',
      });
    }

    const question = await ProductQuestion.findById(id);
    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found',
      });
    }

    // Check if user is admin or vendor of the product
    if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to answer questions',
      });
    }

    question.answer = answer.trim();
    question.answeredBy = req.user._id;
    question.answeredAt = new Date();
    question.status = 'answered';

    await question.save();
    await question.populate('answeredBy', 'name');

    res.status(200).json({
      status: 'success',
      data: { question },
    });
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to answer question',
    });
  }
};

// @desc    Mark answer as helpful
// @route   POST /api/questions/:id/helpful
// @access  Private
export const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await ProductQuestion.findById(id);
    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found',
      });
    }

    // Check if user already marked as helpful
    if (question.helpfulBy.includes(req.user._id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Already marked as helpful',
      });
    }

    question.helpful += 1;
    question.helpfulBy.push(req.user._id);
    await question.save();

    res.status(200).json({
      status: 'success',
      data: { question },
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark as helpful',
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await ProductQuestion.findById(id);
    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found',
      });
    }

    await ProductQuestion.deleteOne({ _id: id });

    res.status(200).json({
      status: 'success',
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete question',
    });
  }
};
